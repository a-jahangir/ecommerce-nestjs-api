import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserProductService } from "./user-product.service";
import { UserAuthGuard } from "src/user/auth/Guard/user.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CategoryEnum } from "src/admin-product/enum/category.enum";
import { ConditionEnum } from "src/admin-product/enum/condition.enum";
import { StorageEnum } from "src/admin-product/enum/storage.enum";
import { UserProductSortEnum } from "./enum/productSort.filter.enum";

@Controller("user/product")
@ApiTags("User-Product")
export class UserProductController {
  constructor(private readonly userProductService: UserProductService) {}
  @Get(":id")
  // @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  async getProductById(@Param("id") id: number) {
    return { data: await this.userProductService.getProductById(id) };
  }

  @Get()
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
    name: "brandId",
    required: false,
    type: Number,
    description: "brand filter",
  })
  @ApiQuery({
    name: "searchTerm",
    required: false,
    type: String,
    description: "Search keyword name, SKU",
  })
  @ApiQuery({
    name: "category",
    required: true,
    enum: CategoryEnum,
  })
  @ApiQuery({
    name: "condition",
    required: false,
    enum: ConditionEnum,
  })
  @ApiQuery({
    name: "storage",
    required: false,
    enum: StorageEnum,
    description: "Storage capacity filter",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: UserProductSortEnum,
    description: "Sorting option",
  })
  @ApiQuery({
    name: "minPrice",
    required: false,
    type: Number,
    description: "Minimum price for filtering",
  })
  @ApiQuery({
    name: "maxPrice",
    required: false,
    type: Number,
    description: "Maximum price for filtering",
  })
  @ApiQuery({
    name: "discount",
    required: false,
    type: Boolean,
    description: "Filter products with discount",
  })
  @ApiQuery({
    name: "visibleOnStore",
    required: false,
    type: Boolean,
    description: "Filter by visibility on store",
  })
  @ApiQuery({
    name: "recommended",
    required: false,
    type: Boolean,
    description: "Filter by recommended status",
  })
  @ApiBearerAuth()
  async getProducts(
    @Query("pageNumber", new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query("pageSize", new DefaultValuePipe(100), ParseIntPipe)
    limit: number = 100,
    @Query("brandId") brandId: number,
    @Query("searchTerm") searchTerm: string,
    @Query("category") category: string,
    @Query("condition") condition: string,
    @Query("storage") storage: string,
    @Query("sortBy") sortBy: string,
    @Query("minPrice", new DefaultValuePipe(0), ParseFloatPipe) minPrice: number,
    @Query("maxPrice", new DefaultValuePipe(1000000), ParseFloatPipe) maxPrice: number,
    @Query("discount") discount: boolean,
    @Query("visibleOnStore") visibleOnStore: boolean,
    @Query("recommended") recommended: boolean
  ) {
    limit = limit > 100 ? 100 : limit;
    page = page < 0 ? 1 : page;
    const skip = limit * (page - 1);
    const take = limit;

    return {
      data: await this.userProductService.getProducts(
        take,
        skip,
        searchTerm,
        category,
        brandId,
        condition,
        storage,
        sortBy,
        minPrice,
        maxPrice,
        discount,
        visibleOnStore,
        recommended
      ),
    };
  }
}
