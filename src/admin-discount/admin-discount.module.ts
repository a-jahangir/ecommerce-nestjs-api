import { Module } from "@nestjs/common";
import { AdminDiscountService } from "./admin-discount.service";
import { AdminDiscountController } from "./admin-discount.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscountCouponEntity } from "../user-discount/entity/discount.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DiscountCouponEntity])],
  providers: [AdminDiscountService],
  controllers: [AdminDiscountController],
})
export class AdminDiscountModule {}
