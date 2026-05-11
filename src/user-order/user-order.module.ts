// user-order/user-order.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "./entity/order.entity";
import { UserOrderService } from "./user-order.service";
import { UserOrderController } from "./user-order.controller";
import { OrderDetailsEntity } from "./entity/order.details.entity";
import { ProductRepository } from "../admin-product/repository/product.repository";
import { ProductEntity } from "src/admin-product/entity/product.entity";
import { ProductTagEntity } from "src/admin-product/entity/product.tag.entity";
import { ProductSpecificationEntity } from "src/admin-product/entity/product.spicification.entity";
import { SpecificationAttributeEntity } from "src/admin-product/entity/specification.attribute.entity";
import { ProductVariantEntity } from "src/admin-product/entity/product.variant.entity";
import { ProductImageEntity } from "src/admin-product/entity/product.images.entity";
import { BrandEntity } from "src/admin-product/entity/brand.entity";
import { ModelEntity } from "src/admin-product/entity/model.entity";
import { ColorEntity } from "src/admin-product/entity/color.entity";
import { DiscountCouponEntity } from "src/user-discount/entity/discount.entity";
import { EventsModule } from "../event/even.module";
import { PaymentModule } from "src/payment/payment.module";
import { MailModule } from "src/mail/mail.module";
import { CountryEntity } from "src/baseinfo/entity/country.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderDetailsEntity,
      ProductEntity,
      ProductTagEntity,
      ProductSpecificationEntity,
      SpecificationAttributeEntity,
      ProductVariantEntity,
      ProductImageEntity,
      BrandEntity,
      ModelEntity,
      ColorEntity,
      DiscountCouponEntity,
      CountryEntity,
    ]),
    EventsModule,
    PaymentModule,
    MailModule,
  ],
  providers: [UserOrderService, ProductRepository],
  controllers: [UserOrderController],
  exports: [UserOrderService],
})
export class UserOrderModule {}
