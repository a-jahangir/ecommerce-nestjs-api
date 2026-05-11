import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import { CreateSpecificationDto } from "./dto/creaete-specification.dto";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { CreateModelDto } from "./dto/create-model.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateTagDto } from "./dto/create-tag.dto";
import { CreateVariantDto } from "./dto/create-variant.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateSpecificationDto } from "./dto/update-specification.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { AdminProductsService } from "./admin-product.service";
import { AdminAuthGuard } from "src/admin/auth/Guard/admin.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CategoryEnum } from "./enum/category.enum";
import { AdminExpressRequest } from "src/admin/auth/types/adminExpressRequest";
import { CreateColorDto } from "./dto/create-color.dto";

@Controller("admin/products")
@ApiTags("Admin-Product")
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  // Brand & Model Endpoints
  @Post("brands")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async createBrand(@Body() dto: CreateBrandDto) {
    return { data: await this.productsService.createBrand(dto) };
  }

  @Get("brands")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getBrands() {
    return { data: await this.productsService.getBrands() };
  }

  @Get("brands/:brandId")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getBrandWithModels(@Param("brandId") brandId: number) {
    return { data: await this.productsService.getBrandWithModels(brandId) };
  }

  @Delete("brands/:brandId")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async deleteBrandById(@Param("brandId") brandId: number, @Req() request: AdminExpressRequest) {
    return {
      data: await this.productsService.deleteBrandById(brandId, request.admin),
    };
  }

  //=======================================================================================================\\
  @Post("colors")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async createColor(@Body() dto: CreateColorDto) {
    return { data: await this.productsService.createColor(dto) };
  }

  @Get("colors")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getColors() {
    return { data: await this.productsService.getColors() };
  }

  @Delete("colors/:colorId")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async deleteColorById(@Param("colorId") colorId: number, @Req() request: AdminExpressRequest) {
    return {
      data: await this.productsService.deleteColorById(colorId, request.admin),
    };
  }
  //=======================================================================================================\\

  @Post("brands/:brandId/models")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async createModel(@Param("brandId") brandId: number, @Body() dto: CreateModelDto) {
    return { data: await this.productsService.createModel(brandId, dto) };
  }

  @Delete("brands/:brandId/models/:modelId")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async deleteModelById(@Param("brandId") brandId: number, @Param("modelId") modelId: number) {
    return { data: await this.productsService.deleteModelById(brandId, modelId) };
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async createProduct(@Body() dto: CreateProductDto) {
    return { data: await this.productsService.createProduct(dto) };
  }

  @Put(":id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async updateProduct(@Param("id") id: number, @Body() dto: UpdateProductDto) {
    return { data: await this.productsService.updateProduct(id, dto) };
  }

  @Get(":id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getProductById(@Param("id") id: number) {
    return { data: await this.productsService.getProductById(id) };
  }

  @Get()
  @UseGuards(AdminAuthGuard)
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
    required: false,
    enum: CategoryEnum,
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
    @Query("visibleOnStore") visibleOnStore: boolean,
    @Query("recommended") recommended: boolean
  ) {
    limit = limit > 100 ? 100 : limit;
    page = page < 0 ? 1 : page;
    const skip = limit * (page - 1);
    const take = limit;

    return {
      data: await this.productsService.getProducts(
        take,
        skip,
        searchTerm,
        category,
        brandId,
        visibleOnStore,
        recommended
      ),
    };
  }

  @Delete(":id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async deleteProduct(@Param("id") id: number) {
    return { data: await this.productsService.deleteProduct(id) };
  }

  // Specification Endpoints
  @Post(":productId/specifications")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async addSpecification(@Param("productId") productId: number, @Body() dto: CreateSpecificationDto) {
    return { data: this.productsService.addSpecification(productId, dto) };
  }

  @Put(":productId/specifications/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async updateSpecification(
    @Param("productId") productId: number,
    @Param("id") id: number,
    @Body() dto: UpdateSpecificationDto
  ) {
    return { data: await this.productsService.updateSpecification(productId, id, dto) };
  }

  @Get(":productId/specifications")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getProductSpecifications(@Param("productId") productId: number) {
    return { data: await this.productsService.getProductSpecifications(productId) };
  }

  @Delete(":productId/specifications/:specId/attribute/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async deleteSpecificationAttribute(
    @Param("productId") productId: number,
    @Param("specId") specId: number,
    @Param("id") id: number
  ) {
    return { data: await this.productsService.deleteSpecificationAttribute(productId, specId, id) };
  }

  @Delete(":productId/specifications/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async deleteSpecification(@Param("productId") productId: number, @Param("id") id: number) {
    return { data: await this.productsService.deleteSpecification(productId, id) };
  }

  // Variant Endpoints
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Post(":productId/variants")
  async addVariant(@Param("productId") productId: number, @Body() dto: CreateVariantDto) {
    return { data: await this.productsService.addVariant(productId, dto) };
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Put(":productId/variants/:id")
  async updateVariant(@Param("productId") productId: number, @Param("id") id: number, @Body() dto: UpdateVariantDto) {
    return { data: await this.productsService.updateVariant(id, productId, dto) };
  }

  @Get(":productId/variants")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getProductVariants(@Param("productId") productId: number) {
    return { data: await this.productsService.getProductVariants(productId) };
  }

  @Get(":productId/variants/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getVarianDetails(@Param("id") id: number, @Param("productId") productId: number) {
    return { data: await this.productsService.getProductVariantDetails(productId, id) };
  }

  @Delete(":productId/variants/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async deleteVariant(@Param("id") id: number, @Param("productId") productId: number) {
    return { data: await this.productsService.deleteVariant(id, productId) };
  }

  // Tag Endpoints
  @Post(":productId/tags")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async addTag(@Param("productId") productId: number, @Body() dto: CreateTagDto) {
    return { data: await this.productsService.addTag(productId, dto) };
  }

  @Delete(":productId/tags/:id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async removeTag(@Param("productId") productId: number, @Param("id") id: number) {
    return { data: await this.productsService.removeTag(productId, id) };
  }
}
