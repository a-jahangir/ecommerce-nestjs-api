import { CreateSpecificationDto } from "../dto/creaete-specification.dto";
import { CreateProductDto } from "../dto/create-product.dto";
import { CreateVariantDto } from "../dto/create-variant.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ProductEntity } from "../entity/product.entity";
import { ProductSpecificationEntity } from "../entity/product.spicification.entity";
import { ProductTagEntity } from "../entity/product.tag.entity";
import { ProductVariantEntity } from "../entity/product.variant.entity";

export interface IProductRepository {
  // Product operations
  createProduct(createProductDto: CreateProductDto): Promise<ProductEntity>;
  updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<ProductEntity>;
  getProductById(id: number): Promise<ProductEntity>;
  getProducts(paginationDto: PaginationDto);
  softDeleteProduct(id: number): Promise<void>;
  // Specification operations
  addSpecification(
    productId: number,
    createSpecificationDto: CreateSpecificationDto
  ): Promise<ProductSpecificationEntity>;
  updateSpecification(
    id: number,
    updateSpecificationDto: Partial<CreateSpecificationDto>
  ): Promise<ProductSpecificationEntity>;
  removeSpecification(id: number): Promise<void>;
  // Variant operations
  addVariant(productId: number, createVariantDto: CreateVariantDto): Promise<ProductVariantEntity>;
  updateVariant(id: number, updateVariantDto: Partial<CreateVariantDto>): Promise<ProductVariantEntity>;
  getProductVariants(productId: number): Promise<ProductVariantEntity[]>;
  removeVariant(id: number): Promise<void>;
  // Tag operations
  addTag(productId: number, value: string): Promise<ProductTagEntity>;
  removeTag(id: number): Promise<void>;
}
