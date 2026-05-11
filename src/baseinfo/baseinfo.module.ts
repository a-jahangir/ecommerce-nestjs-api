import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { BaseInfoService } from "./baseinfo.service";
import { CountryEntity } from "./entity/country.entity";
import { LanguageEntity } from "./entity/language.entity";
import { BaseinfoController } from "./baseinfo.controller";
import { BrandEntity } from "../admin-product/entity/brand.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity, LanguageEntity, BrandEntity])],
  providers: [BaseInfoService],
  exports: [BaseInfoService],
  controllers: [BaseinfoController],
})
export class BaseinfoModule {}
