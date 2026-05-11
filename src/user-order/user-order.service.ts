import { promises as fs } from "fs";
import * as path from "path";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "./entity/order.entity";
import { CreateOrderDto } from "./dto/create.order.dto";
import { UserEntity } from "../user/entity/user.entity";
import { OrderStatusEnum } from "./enum/order.status.enum";
import { OrderDetailsEntity } from "./entity/order.details.entity";
import { ProductVariantEntity } from "../admin-product/entity/product.variant.entity";
import { PaymentService } from "src/payment/payment.service";
import { CreateCheckoutPayloadDTO, ItemDTO } from "src/payment/dto/create.checkout.payload.dto";
import { DiscountCouponEntity } from "src/user-discount/entity/discount.entity";
import { DiscountTypeEnum } from "src/user-discount/enum/discountType.enum";
import { ConfigService, ConfigType } from "@nestjs/config";
import appEnvConfig from "src/config/app.env.config";
import Stripe from "stripe";
import { OrderResponseDto } from "./dto/order-response.dto";
import { MailStrategyService } from "src/mail/strategy/mail-strategy.service";
import { MailProviderEnum } from "src/mail/enum/mail-provider.enum";
import { TemplateNameEnum } from "src/mail/enum/template-name.enum";
import { CountryEntity } from "src/baseinfo/entity/country.entity";

@Injectable()
export class UserOrderService {
  private stripe: Stripe;
  private readonly templatesDir: string;
  constructor(
    private readonly paymentService: PaymentService,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderDetailsEntity)
    private readonly orderDetailsRepo: Repository<OrderDetailsEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly productVariantRepo: Repository<ProductVariantEntity>,
    @InjectRepository(DiscountCouponEntity)
    private readonly discountCouponRepo: Repository<DiscountCouponEntity>,
    private readonly dataSource: DataSource,
    @InjectRepository(CountryEntity)
    private readonly countryRepo: Repository<CountryEntity>,
    private readonly configService: ConfigService<ConfigType<typeof appEnvConfig>>,
    private readonly mailStrategyService: MailStrategyService
  ) {
    this.templatesDir = path.join(process.cwd(), "dist/templates");
    const stripeConfig = this.configService.get("checkout", { infer: true }).stripe;
    this.stripe = new Stripe(stripeConfig.secret, {
      apiVersion: "2025-07-30.basil",
    });
  }

  private async sendOrderSetEmail(to: string, customerName: string, orderNumber: string): Promise<void> {
    const mailService = this.mailStrategyService.getStrategy(MailProviderEnum.hostinger);
    const templateWithCode = await this.getTemplateWithCustomerNameAndOrderNumber(
      TemplateNameEnum.order_set,
      customerName,
      orderNumber
    );
    await mailService.sendMail(to, "Order Set", templateWithCode);
  }

  private async sendOrderPaidToAdmin(to: string): Promise<void> {
    const mailService = this.mailStrategyService.getStrategy(MailProviderEnum.hostinger);
    const templateAdminOrder = await this.getTemplateOrderForAdmin(TemplateNameEnum.admin_order, "");
    await mailService.sendMail(to, "Admin Order Set", templateAdminOrder);
  }

  private async sendOrderCompletedEmail(to: string, customerName: string, orderNumber: string): Promise<void> {
    const mailService = this.mailStrategyService.getStrategy(MailProviderEnum.hostinger);
    const templateWithCode = await this.getTemplateWithCustomerNameAndOrderNumber(
      TemplateNameEnum.order_completed,
      customerName,
      orderNumber
    );
    await mailService.sendMail(to, "Order Completed", templateWithCode);
  }

  async getTemplateOrderForAdmin(templateName: string, adminOrderUrl: string): Promise<string> {
    try {
      const filePath = path.join(this.templatesDir, templateName);
      let fileContent = await fs.readFile(filePath, "utf-8");
      fileContent = fileContent.replace("{{adminOrdersUrl}}", adminOrderUrl);
      return fileContent;
    } catch (error) {
      console.error("Error reading or processing the template:", error);
      return null;
    }
  }

  async getTemplateWithCustomerNameAndOrderNumber(
    templateName: string,
    customerName: string,
    orderNumber: string
  ): Promise<string> {
    try {
      const filePath = path.join(this.templatesDir, templateName);
      let fileContent = await fs.readFile(filePath, "utf-8");
      fileContent = fileContent.replace("{{Customer Name}}", customerName);
      fileContent = fileContent.replace("{{ORDER_NUMBER}}", orderNumber);
      return fileContent;
    } catch (error) {
      console.error("Error reading or processing the template:", error);
      return null;
    }
  }

  // NEW: Get orders by status
  async getOrdersByStatus(user: UserEntity, status: OrderStatusEnum, take: number, skip: number) {
    return await this.orderRepo.find({
      where: {
        user: { id: user.id },
        status,
      },
      relations: ["details", "details.variant", "details.variant.product"],
      order: { createAt: "DESC" },
      take,
      skip,
    });
  }

  // NEW: Verify payment session
  async verifyPayment(orderId: number, sessionId: string, user: UserEntity) {
    const order = await this.getOrderById(orderId, user);

    if (order.status !== OrderStatusEnum.PENDING) {
      return { verified: true, order };
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        await this.handlePaymentSuccess(orderId);
        await this.sendOrderSetEmail(user.email, user.firstName + " " + user.lastName, order.orderNumber);
        await this.sendOrderPaidToAdmin(this.configService.get("admin", { infer: true }).email);
        return { verified: true, order: await this.getOrderById(orderId, user) };
      } else {
        return { verified: false, order };
      }
    } catch (error) {
      throw new BadRequestException("Failed to verify payment session");
    }
  }

  // NEW: Cancel order with user validation
  async cancelOrder(orderId: number, user: UserEntity) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: user.id } },
      relations: ["details", "details.variant"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException("Only pending orders can be cancelled");
    }

    // Restore stock
    for (const detail of order.details) {
      detail.variant.quantity += detail.quantity;
      await this.productVariantRepo.save(detail.variant);
    }

    // Update order status
    order.status = OrderStatusEnum.CANCELLED;
    return await this.orderRepo.save(order);
  }

  async handlePaymentSuccess(orderId: number): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ["details", "details.variant"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.status = OrderStatusEnum.PAID;
    order.paidAt = new Date();

    await this.orderRepo.save(order);

    if (order.discount) {
      const discount = await this.discountCouponRepo.findOne({
        where: { code: order.discount },
      });

      if (!discount) {
        throw new BadRequestException("Discount coupon not found");
      }

      if (!discount.isActive) {
        throw new BadRequestException("Discount coupon is inactive");
      }

      if (discount.usageCount >= discount.usageLimit) {
        throw new BadRequestException("Discount usage limit exceeded");
      }

      discount.usageCount += 1;

      if (discount.usageCount >= discount.usageLimit) {
        discount.isActive = false;
      }

      await this.discountCouponRepo.save(discount);
    }
  }

  async handlePaymentFailure(orderId: number): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ["details", "details.variant"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Restore stock
    for (const detail of order.details) {
      detail.variant.quantity += detail.quantity;
      await this.productVariantRepo.save(detail.variant);
    }

    order.status = OrderStatusEnum.FAILED;
    await this.orderRepo.save(order);
  }

  async createOrder(data: CreateOrderDto, user: UserEntity) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create and prepare order
      const order = await this.prepareOrder(data, user, queryRunner);
      order.orderNumber = await this.generateOrderNumber();

      // Process and validate order items
      const { variants, orderDetails, items, discounts } = await this.processOrderItems(data.details, order);

      // Save order and details
      await this.saveOrderAndDetails(order, orderDetails, queryRunner);

      // Update product stock
      await this.updateProductStock(variants, orderDetails, queryRunner);

      // Create checkout session
      const checkoutSession = await this.createCheckoutSession(order, items, discounts);

      await queryRunner.commitTransaction();

      return this.buildSuccessResponse(order, checkoutSession);
    } catch (error) {
      await this.handleTransactionError(queryRunner, error);
    } finally {
      await queryRunner.release();
    }
  }

  private async generateOrderNumber(): Promise<string> {
    let coupon = "";
    const [orders, totalItem] = await this.orderRepo.findAndCount();
    coupon = `${totalItem + 1}`;
    // const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    // const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // let coupon = letters.charAt(Math.floor(Math.random() * letters.length));
    // for (let i = 1; i < 16; i++) {
    //   coupon += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
    // }
    return coupon;
  }

  // Helper methods
  private async prepareOrder(data: CreateOrderDto, user: UserEntity, queryRunner: QueryRunner): Promise<OrderEntity> {
    const order = new OrderEntity();
    order.status = OrderStatusEnum.PENDING;
    order.user = user;
    order.price = data.price;
    order.userEmail = user.email ?? "";
    order.userFirstName = user.firstName;
    order.userLastName = user.lastName;
    order.userPostalCode = user.profile.postalCode ?? "";
    order.userAddress = user.profile.address ?? "";
    order.phoneNumber = user.profile.phone ?? "";
    if (user.profile.countryId !== 0)
      order.countryName =
        (await this.countryRepo.findOne({ where: { id: user.profile.countryId } })).secondaryName ?? "";
    if (data.discount) {
      return await this.applyDiscount(order, data.discount, data.price);
    }

    return order;
  }

  private async saveOrderAndDetails(
    order: OrderEntity,
    orderDetails: OrderDetailsEntity[],
    queryRunner: QueryRunner
  ): Promise<void> {
    const savedOrder = await queryRunner.manager.save(order);

    orderDetails.forEach((detail) => {
      detail.order = savedOrder;
    });

    await queryRunner.manager.save(orderDetails);
  }

  private async createCheckoutSession(order: OrderEntity, items: any[], discounts: any[]): Promise<any> {
    const checkoutDto: CreateCheckoutPayloadDTO = {
      items,
      discounts,
      metadata: { orderId: order.id },
    };

    return await this.paymentService.createCheckoutSession("stripe", checkoutDto);
  }

  private buildSuccessResponse(order: OrderEntity, checkoutSession: any): { order: OrderEntity; checkoutUrl: string } {
    return {
      order,
      checkoutUrl: checkoutSession.url,
    };
  }

  private async handleTransactionError(queryRunner: QueryRunner, error: any): Promise<void> {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw error;
  }

  private async applyDiscount(order: OrderEntity, discountCode: string, originalPrice: number) {
    const discount = await this.discountCouponRepo.findOne({
      where: { code: discountCode },
    });

    if (!discount) {
      throw new BadRequestException("Invalid discount code");
    }

    if (!discount.isActive || discount.usageCount >= discount.usageLimit) {
      throw new BadRequestException("Discount code is no longer valid");
    }

    // Apply discount based on type
    if (discount.discountType === DiscountTypeEnum.FIXED) {
      order.price = originalPrice - discount.discountAmount;
    } else if (discount.discountType === DiscountTypeEnum.PERCENTAGE) {
      const discountAmount = (originalPrice * discount.discountPercentage) / 100;
      order.price = originalPrice - Math.min(discountAmount, discount.maxDiscount || discountAmount);
    }

    order.discount = discount.code;

    // Update discount usage
    // discount.usageCount += 1;
    // if (discount.usageCount >= discount.usageLimit) {
    //   discount.isActive = false;
    // }

    // await this.discountCouponRepo.save(discount);

    return order;
  }

  private async processOrderItems(details: any[], order: OrderEntity) {
    if (!details || details.length === 0) {
      throw new BadRequestException("Order must contain at least one item");
    }

    const variants: ProductVariantEntity[] = [];
    const orderDetails: OrderDetailsEntity[] = [];
    const items: ItemDTO[] = [];
    const discounts: { coupon: string }[] = [];

    for (const item of details) {
      const { product_id, quantity, variant_id } = item;

      const variant = await this.productVariantRepo.findOne({
        where: { id: variant_id, product: { id: product_id } },
        relations: ["product"],
      });

      if (!variant) {
        throw new NotFoundException(`Variant ${variant_id} for product ${product_id} not found`);
      }

      if (variant.quantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${variant_id}. Available: ${variant.quantity}, Requested: ${quantity}`
        );
      }

      variants.push(variant);

      const orderDetail = new OrderDetailsEntity();
      orderDetail.altText = variant.altText;
      orderDetail.basePrice = variant.basePrice;
      orderDetail.brandNewPrice = variant.brandNewPrice;
      orderDetail.discount = variant.discount;
      orderDetail.hasAdapter = variant.hasAdapter;
      orderDetail.hasAirPod = variant.hasAirPod;
      orderDetail.hasChargingCable = variant.hasChargingCable;
      orderDetail.hasSIMTray = variant.hasSIMTray;
      orderDetail.primary = variant.primary;
      orderDetail.condition = variant.condition;
      orderDetail.color = variant.color;
      orderDetail.variant = variant;
      orderDetail.quantity = quantity;
      orderDetail.storage = variant.storage;
      orderDetail.SKU = variant.SKU;
      orderDetails.push(orderDetail);

      const unitPrice =
        variant.discount > 0 ? variant.basePrice - (variant.basePrice * variant.discount) / 100 : variant.basePrice;

      items.push({
        quantity,
        currency: "EUR",
        name: variant.product.name,
        amount: Math.round(unitPrice * 100), // Convert to cents
      });
    }

    if (order.discount) {
      const discount = await this.discountCouponRepo.findOne({
        where: { code: order.discount },
      });

      if (discount) {
        const randomId = `coupon_${discount.code}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        let stripeCoupon;
        if (discount.discountType === "percentage") {
          stripeCoupon = await this.stripe.coupons.create({
            id: randomId,
            percent_off: discount.discountPercentage,
            duration: "once",
          });
        } else if (discount.discountType === "fixed") {
          stripeCoupon = await this.stripe.coupons.create({
            id: randomId,
            amount_off: Math.round(discount.discountAmount * 100),
            currency: "EUR",
            duration: "once",
          });
        }

        // Add this new Stripe coupon to the discounts array
        discounts.push({ coupon: stripeCoupon.id });
      }
    }

    return { variants, orderDetails, items, discounts };
  }

  async updateOrderStatus(orderId: number, status: OrderStatusEnum) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ["details", "details.variant"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.status = status;
    return await this.orderRepo.save(order);
  }

  async restoreOrderStock(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ["details", "details.variant"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    for (const detail of order.details) {
      detail.variant.quantity += detail.quantity;
      await this.productVariantRepo.save(detail.variant);
    }

    return order;
  }

  // async cancelOrder(orderId: string) {
  //   const order = await this.orderRepo.findOne({
  //     where: { id: orderId },
  //     relations: ["details", "details.variant"],
  //   });

  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${orderId} not found`);
  //   }

  //   if (order.status !== OrderStatusEnum.PENDING) {
  //     throw new BadRequestException("Only pending orders can be cancelled");
  //   }

  //   // Restore stock
  //   for (const detail of order.details) {
  //     detail.variant.quantity += detail.quantity;
  //     await this.productVariantRepo.save(detail.variant);
  //   }

  //   // Update order status
  //   order.status = OrderStatusEnum.FAILED;
  //   return await this.orderRepo.save(order);
  // }

  async getOrderById(orderId: number, user: UserEntity) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: user.id } },
      relations: ["details", "details.variant", "details.variant.product"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async getUserOrders(
    user: UserEntity,
    take: number,
    skip: number
  ): Promise<{ orders: OrderEntity[]; totalItems: number }> {
    const [orders, totalItems] = await this.orderRepo.findAndCount({
      where: { user: { id: user.id } },
      relations: ["details", "details.variant", "details.variant.product"],
      order: { createAt: "DESC" },
      take,
      skip,
    });

    // return orders.map((order) => this.mapOrderToResponseDto(user, order));
    return { orders, totalItems };
  }

  private mapOrderToResponseDto(user: UserEntity, order: OrderEntity): OrderResponseDto {
    return {
      orderId: order.id,
      createdAt: order.createAt,
      orderStatus: order.status,
      buyerProfile: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      paymentId: order.orderNumber,
      paymentStatus: order.status,
      productData: order.details.map((detail) => ({
        productId: detail.variant.product.id.toString(),
        productName: detail.variant.product.name,
        productImage: detail.variant.product.images?.[0].filePath,
        variantId: detail.variant.id.toString(),
        variantName: detail.variant.SKU,
        quantity: detail.quantity,
        unitPrice: order.price,
        totalPrice: detail.quantity * order.price,
      })),
      selectedVariantData: order.details.map((detail) => detail.variant),
      totalAmount: order.price,
      shippingAddress: order.shipmentURL,
    };
  }

  private async updateProductStock(
    variants: ProductVariantEntity[],
    orderDetails: OrderDetailsEntity[],
    queryRunner: any
  ) {
    for (const variant of variants) {
      const orderDetail = orderDetails.find((detail) => detail.variant.id === variant.id);
      if (orderDetail) {
        variant.quantity -= orderDetail.quantity;
        await queryRunner.manager.save(ProductVariantEntity, variant);
      }
    }
  }
}
