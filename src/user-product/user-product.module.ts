import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserProductService } from "./user-product.service";
import { UserProductController } from "./user-product.controller";
import { ProductEntity } from "../admin-product/entity/product.entity";
import { ProductTagEntity } from "../admin-product/entity/product.tag.entity";
import { ProductSpecificationEntity } from "../admin-product/entity/product.spicification.entity";
import { SpecificationAttributeEntity } from "../admin-product/entity/specification.attribute.entity";
import { ProductVariantEntity } from "../admin-product/entity/product.variant.entity";
import { ProductImageEntity } from "../admin-product/entity/product.images.entity";
import { BrandEntity } from "../admin-product/entity/brand.entity";
import { ModelEntity } from "../admin-product/entity/model.entity";
import { ProductRepository } from "src/admin-product/repository/product.repository";
import { ColorEntity } from "src/admin-product/entity/color.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductTagEntity,
      ProductSpecificationEntity,
      SpecificationAttributeEntity,
      ProductVariantEntity,
      ProductImageEntity,
      BrandEntity,
      ModelEntity,
      ColorEntity,
    ]),
  ],
  providers: [UserProductService, ProductRepository],
  controllers: [UserProductController],
})
export class UserProductModule {}
