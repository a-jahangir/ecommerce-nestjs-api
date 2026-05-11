import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrderService } from "./admin-order.service";
import { AdminOrderController } from "./admin-order.controller";
import { OrderEntity } from "../user-order/entity/order.entity";
import { OrderDetailsEntity } from "../user-order/entity/order.details.entity";
import { ProductRepository } from "src/admin-product/repository/product.repository";
import { ProductEntity } from "src/admin-product/entity/product.entity";
import { ProductTagEntity } from "src/admin-product/entity/product.tag.entity";
import { ProductSpecificationEntity } from "src/admin-product/entity/product.spicification.entity";
import { SpecificationAttributeEntity } from "src/admin-product/entity/specification.attribute.entity";
import { ProductVariantEntity } from "src/admin-product/entity/product.variant.entity";
import { ProductImageEntity } from "src/admin-product/entity/product.images.entity";
import { BrandEntity } from "src/admin-product/entity/brand.entity";
import { ModelEntity } from "src/admin-product/entity/model.entity";
import { ColorEntity } from "src/admin-product/entity/color.entity";
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
      CountryEntity,
    ]),
    MailModule,
  ],
  providers: [AdminOrderService, ProductRepository],
  controllers: [AdminOrderController],
})
export class AdminOrderModule {}
