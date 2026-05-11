import { promises as fs } from "fs";
import * as path from "path";
import { Between, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AdminEntity } from "../admin/entity/admin.entity";
import { OrderEntity } from "../user-order/entity/order.entity";
import { OrderStatusEnum } from "../user-order/enum/order.status.enum";
import { OrderResponseDto } from "src/user-order/dto/order-response.dto";
import { AdminOrderResponseDto } from "./dto/admin.order-response.dto";
import { MailStrategyService } from "src/mail/strategy/mail-strategy.service";
import { TemplateNameEnum } from "src/mail/enum/template-name.enum";
import { MailProviderEnum } from "src/mail/enum/mail-provider.enum";

@Injectable()
export class AdminOrderService {
  private readonly templatesDir: string;
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly mailStrategyService: MailStrategyService
  ) {
    this.templatesDir = path.join(process.cwd(), "dist/templates");
  }

  private async sendOrderCompletedEmail(
    to: string,
    customerName: string,
    orderNumber: string,
    shipmentUrl: string
  ): Promise<void> {
    const mailService = this.mailStrategyService.getStrategy(MailProviderEnum.hostinger);
    const templateWithCode = await this.getTemplateWithCustomerNameAndOrderNumber(
      TemplateNameEnum.order_completed,
      customerName,
      orderNumber,
      shipmentUrl
    );
    await mailService.sendMail(to, "Order Completed", templateWithCode);
  }

  async getTemplateWithCustomerNameAndOrderNumber(
    templateName: string,
    customerName: string,
    orderNumber: string,
    shipmentUrl: string
  ): Promise<string> {
    try {
      const filePath = path.join(this.templatesDir, templateName);
      let fileContent = await fs.readFile(filePath, "utf-8");
      fileContent = fileContent.replace("{{CustomerName}}", customerName);
      fileContent = fileContent.replace("{{ORDER_NUMBER}}", orderNumber);
      fileContent = fileContent.replace("{{dhlUrl}}", shipmentUrl);
      return fileContent;
    } catch (error) {
      console.error("Error reading or processing the template:", error);
      return null;
    }
  }

  // NEW: Get orders by status
  async getOrdersByStatus(status: OrderStatusEnum, take: number, skip: number) {
    const [orders, totalItems] = await this.orderRepo.findAndCount({
      where: { status },
      relations: ["user", "details", "details.variant"],
      take,
      skip,
      order: { createAt: "DESC" },
    });

    return { orders, totalItems };
  }

  // NEW: Update order status
  async updateOrderStatus(orderId: number, status: OrderStatusEnum, adminNotes?: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ["details", "details.variant"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.status = status;

    if (adminNotes) {
      // Add admin notes to order (you might need to add this field to OrderEntity)
      // order.adminNotes = adminNotes;
    }

    return await this.orderRepo.save(order);
  }

  // NEW: Get order statistics
  async getOrderStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate && endDate) {
      where.createAt = Between(startDate, endDate);
    }

    const orders = await this.orderRepo.find({ where });

    const statistics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.price, 0),
      byStatus: {},
      averageOrderValue: 0,
    };

    // Count orders by status
    orders.forEach((order) => {
      statistics.byStatus[order.status] = (statistics.byStatus[order.status] || 0) + 1;
    });

    if (orders.length > 0) {
      statistics.averageOrderValue = statistics.totalRevenue / orders.length;
    }

    return statistics;
  }

  async getOrders(take: number, skip: number, status?: OrderStatusEnum) {
    if (status) {
      const [orders, totalItems] = await this.orderRepo.findAndCount({
        take,
        skip,
        where: { status },
        order: { createAt: "DESC" },
      });
      return { orders, totalItems };
    } else {
      const [orders, totalItems] = await this.orderRepo.findAndCount({
        take,
        skip,
        order: { createAt: "DESC" },
      });
      return { orders, totalItems };
    }
  }

  async updateOrder(shipmentUrl: string, admin: AdminEntity, orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: ["user"] });
    // if (order && order.status == OrderStatusEnum.PAID) {
    order.shipmentURL = shipmentUrl;
    order.status = OrderStatusEnum.ADMIN_APPOVED;
    this.sendOrderCompletedEmail(
      order.user.email,
      order.user.firstName + " " + order.user.lastName,
      order.orderNumber,
      shipmentUrl
    );
    return await this.orderRepo.save(order);
    // } else throw new NotFoundException();
  }

  private mapOrderToResponseDto(order: OrderEntity): OrderResponseDto {
    return {
      orderId: order.id,
      createdAt: order.createAt,
      orderStatus: order.status,
      buyerProfile: {
        userId: order.user.id,
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        // phone: order.user.phone,
      },
      paymentId: order.orderNumber,
      paymentStatus: order.status,
      productData: order.details.map((detail) => ({
        productId: detail.variant.product.id.toString(),
        productName: detail.variant.product.name,
        productImage: detail.variant.product.images?.[0].filePath,
        variantId: detail.variant.id.toString(),
        variantName: detail.variant.SKU,
        // variantAttributes: detail.variant.,
        quantity: detail.quantity,
        unitPrice: detail.order.price,
        totalPrice: detail.quantity * detail.order.price,
      })),
      selectedVariantData: order.details.map((detail) => detail.variant),
      totalAmount: order.price,
      shippingAddress: order.shipmentURL,
    };
  }

  async getAdminOrders(take: number, skip: number, filters?: any): Promise<AdminOrderResponseDto[]> {
    const queryBuilder = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.details", "details")
      .leftJoinAndSelect("details.variant", "variant")
      .leftJoinAndSelect("variant.product", "product")
      .leftJoinAndSelect("order.payment", "payment")
      .leftJoinAndSelect("order.shippingAddress", "shippingAddress")
      .orderBy("order.createdAt", "DESC")
      .take(take)
      .skip(skip);

    if (filters) {
      // Add filter logic based on status, date range, etc.
      if (filters.status) {
        queryBuilder.andWhere("order.status = :status", { status: filters.status });
      }
      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }
    }

    const orders = await queryBuilder.getMany();
    return orders.map((order) => this.mapOrderToAdminResponseDto(order));
  }

  private mapOrderToAdminResponseDto(order: OrderEntity): AdminOrderResponseDto {
    const baseResponse = this.mapOrderToResponseDto(order);
    return {
      ...baseResponse,
      adminNotes: "",
      internalStatus: order.status,
      costPrice: order.price,
    };
  }

  async getOrderById(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ["details", "details.variant", "details.variant.product"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async changeStatusOrder(orderId: number, admin: AdminEntity, status: OrderStatusEnum): Promise<OrderEntity> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (order) {
      if (this.isValueInEnum(OrderStatusEnum, status)) order.status = status;
    }
    return await this.orderRepo.save(order);
  }

  private isValueInEnum<T>(enumType: T, value: string | number): boolean {
    return Object.values(enumType).includes(value);
  }
}
