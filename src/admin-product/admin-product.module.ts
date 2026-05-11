import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "./entity/product.entity";
import { ProductSpecificationEntity } from "./entity/product.spicification.entity";
import { SpecificationAttributeEntity } from "./entity/specification.attribute.entity";
import { ProductTagEntity } from "./entity/product.tag.entity";
import { ProductVariantEntity } from "./entity/product.variant.entity";
import { BrandEntity } from "./entity/brand.entity";
import { ModelEntity } from "./entity/model.entity";
import { AdminProductsService } from "./admin-product.service";
import { AdminProductsController } from "./admin-product.controller";
import { ProductRepository } from "./repository/product.repository";
import { ProductImageEntity } from "./entity/product.images.entity";
import { ColorEntity } from "./entity/color.entity";
import { CountryEntity } from "src/baseinfo/entity/country.entity";

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
      CountryEntity,
    ]),
  ],
  providers: [AdminProductsService, ProductRepository],
  controllers: [AdminProductsController],
  exports: [ProductRepository],
})
export class AdminProductModule {}
