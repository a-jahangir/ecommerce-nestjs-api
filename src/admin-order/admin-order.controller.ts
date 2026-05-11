import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminOrderService } from "./admin-order.service";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AdminAuthGuard } from "src/admin/auth/Guard/admin.guard";
import { AdminExpressRequest } from "src/admin/auth/types/adminExpressRequest";
import { UpdateAdminOrderDto } from "./dto/update.admin.order.dto";
import { OrderStatusEnum } from "src/user-order/enum/order.status.enum";

@Controller("admin/orders")
@ApiTags("Admin-Order")
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @Patch("order/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async updateStatusOrder(
    @Param("id") id: number,
    @Req() request: AdminExpressRequest,
    @Body() data: UpdateAdminOrderDto
  ) {
    return {
      data: await this.adminOrderService.updateOrder(data.shipmentUrl, request.admin, id),
    };
  }

  @Patch("order/:id/:status")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async changeStatusOrder(
    @Param("id") id: number,
    @Param("status") status: OrderStatusEnum,
    @Req() request: AdminExpressRequest
  ) {
    return {
      data: await this.adminOrderService.changeStatusOrder(id, request.admin, status),
    };
  }

  @Get("order/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getOrderDetails(@Param("id") id: number, @Req() request: AdminExpressRequest) {
    return {
      data: await this.adminOrderService.getOrderById(id),
    };
  }

  // NEW: Get orders by status
  @Get("order")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: "pageNumber",
    required: false,
    type: Number,
    description: "page number",
  })
  @ApiQuery({
    name: "pageSize",
    required: false,
    type: Number,
    description: "size of page",
  })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    description: "status of payment",
    example: OrderStatusEnum,
  })
  async getOrdersByStatus(
    @Query("pageNumber", new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query("pageSize", new DefaultValuePipe(100), ParseIntPipe)
    limit: number = 100,
    @Query("status") status: OrderStatusEnum
  ) {
    limit = limit > 100 ? 100 : limit;
    page = page < 0 ? 1 : page;
    const skip = limit * (page - 1);
    const take = limit;

    return {
      data: await this.adminOrderService.getOrders(take, skip, status),
    };
  }

  // NEW: Get order statistics
  @Get("statistics")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getOrderStatistics(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    return {
      data: await this.adminOrderService.getOrderStatistics(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      ),
    };
  }
}
