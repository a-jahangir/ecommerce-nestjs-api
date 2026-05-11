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
import { UserOrderService } from "./user-order.service";
import { UserAuthGuard } from "../user/auth/Guard/user.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UserExpressRequest } from "src/user/auth/types/user-express-request";
import { CreateOrderDto } from "./dto/create.order.dto";
import { OrderStatusEnum } from "./enum/order.status.enum";
import { VerifyPaymentDto } from "./dto/verify.payment.dto";

@Controller("user/orders")
@ApiTags("User-Order")
export class UserOrderController {
  constructor(private readonly userOrderService: UserOrderService) {}

  @Post("order")
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async createNewOrder(@Body() data: CreateOrderDto, @Req() req: UserExpressRequest) {
    return {
      data: await this.userOrderService.createOrder(data, req.user),
    };
  }

  @Get("order")
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
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
  async getOrders(
    @Query("pageNumber", new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query("pageSize", new DefaultValuePipe(100), ParseIntPipe)
    limit: number = 100,
    @Req() req: UserExpressRequest
  ) {
    limit = limit > 100 ? 100 : limit;
    page = page < 0 ? 1 : page;
    const skip = limit * (page - 1);
    const take = limit;
    return {
      data: await this.userOrderService.getUserOrders(req.user, take, skip),
    };
  }

  @Get("order/:id")
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async getOrderDetails(@Param("id") id: number, @Req() req: UserExpressRequest) {
    return {
      data: await this.userOrderService.getOrderById(id, req.user),
    };
  }

  // NEW: Cancel order
  @Patch("order/:id/cancel")
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async cancelOrder(@Param("id") id: number, @Req() req: UserExpressRequest) {
    return {
      data: await this.userOrderService.cancelOrder(id, req.user),
    };
  }

  // NEW: Get orders by status
  @Get("order/status/:status")
  @UseGuards(UserAuthGuard)
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
  async getOrdersByStatus(
    @Param("status") status: OrderStatusEnum,
    @Query("pageNumber", new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query("pageSize", new DefaultValuePipe(100), ParseIntPipe)
    limit: number = 100,
    @Req() req: UserExpressRequest
  ) {
    limit = limit > 100 ? 100 : limit;
    page = page < 0 ? 1 : page;
    const skip = limit * (page - 1);
    const take = limit;

    return {
      data: await this.userOrderService.getOrdersByStatus(req.user, status, take, skip),
    };
  }

  // NEW: Verify payment after redirect
  @Post("order/:id/verify-payment")
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async verifyPayment(@Param("id") id: number, @Body() body: VerifyPaymentDto, @Req() req: UserExpressRequest) {
    return {
      data: await this.userOrderService.verifyPayment(id, body.sessionId, req.user),
    };
  }
}
