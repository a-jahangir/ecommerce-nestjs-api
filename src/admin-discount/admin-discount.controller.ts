import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminDiscountService } from "./admin-discount.service";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AdminAuthGuard } from "src/admin/auth/Guard/admin.guard";
import { AdminExpressRequest } from "src/admin/auth/types/adminExpressRequest";
import { CreateAdminDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { UserAuthGuard } from "src/user/auth/Guard/user.guard";

@Controller("admin/discounts")
@ApiTags("Admin-Discount")
export class AdminDiscountController {
  constructor(private readonly adminDiscountService: AdminDiscountService) {}

  @ApiQuery({
    name: "pageNumber",
    required: true,
    type: Number,
    description: "page number",
  })
  @ApiQuery({
    name: "pageSize",
    required: true,
    type: Number,
    description: "size of page",
  })
  @ApiQuery({
    name: "searchKey",
    required: false,
    type: String,
    description: "Search keyword on code",
  })
  @Get("coupons")
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async getDiscountList(
    @Query("pageNumber", new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query("pageSize", new DefaultValuePipe(100), ParseIntPipe)
    limit: number = 100,
    @Query("searchKey")
    searchKey: string
  ) {
    limit = limit > 100 ? 100 : limit;
    page = page < 0 ? 1 : page;
    const skip = limit * (page - 1);
    const take = limit;
    return {
      data: await this.adminDiscountService.getDiscountList(take, skip, searchKey),
    };
  }

  @Get("coupons/:id")
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async getDiscountCouponDetails(@Param("id") id: number, @Req() request: AdminExpressRequest) {
    return {
      data: await this.adminDiscountService.getDiscountDetails(id, request.admin),
    };
  }

  @Get("coupons/code/:code")
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async getCouponByCode(@Param("code") couponCode: string) {
    return {
      data: await this.adminDiscountService.getDiscountByCoupon(couponCode),
    };
  }

  @Patch("coupons/:id/activation")
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async activateDiscount(@Req() request: AdminExpressRequest, @Param("id") id: number) {
    return {
      data: await this.adminDiscountService.activateDiscount(request.admin, id),
    };
  }

  @Post("coupons")
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async createDiscountCoupon(@Req() request: AdminExpressRequest, @Body() data: CreateAdminDiscountDto) {
    return {
      data: {
        discountCoupon: await this.adminDiscountService.createDiscountCoupon(request.admin, data),
      },
    };
  }

  @Patch("coupons/:id")
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async updateDiscount(@Req() request: AdminExpressRequest, @Param("id") id: number, @Body() data: UpdateDiscountDto) {
    return {
      data: {
        discountCoupon: await this.adminDiscountService.updateDiscountDto(id, data, request.admin),
      },
    };
  }
}
