import { Injectable } from "@nestjs/common";
import { CreateSpecificationDto } from "./dto/creaete-specification.dto";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { CreateModelDto } from "./dto/create-model.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateTagDto } from "./dto/create-tag.dto";
import { CreateVariantDto } from "./dto/create-variant.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateSpecificationDto } from "./dto/update-specification.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { ProductRepository } from "./repository/product.repository";
import { ProductResponseDto } from "./dto/product.response.dto";
import { BrandResponseDto } from "./dto/brand-response.dto";
import { ModelResponseDto } from "./dto/model-response.dto";
import { ProductEntity } from "./entity/product.entity";
import { BrandEntity } from "./entity/brand.entity";
import { ModelEntity } from "./entity/model.entity";
import { ProductListDto } from "./dto/product.list.dto";
import { AdminEntity } from "src/admin/entity/admin.entity";
import { CreateColorDto } from "./dto/create-color.dto";
import { ColorResponseDto } from "./dto/color-response.dto";

@Injectable()
export class AdminProductsService {
  constructor(private readonly productRepo: ProductRepository) {}

  private createResponseData<T>(mapper: (...args: any[]) => T, ...args: any[]): T {
    return mapper(...args);
  }

  // Product Operations
  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepo.createProduct(dto);
    return this.createResponseData<ProductResponseDto>(
      (product: ProductEntity) => ({
        id: product.id,
        brand: {
          id: product.brand.id,
          title: product.brand.title,
          createAt: product.brand.createAt,
          updateAt: product.brand.updateAt,
        },
        category: product.category,
        model: {
          id: product.model.id,
          brandId: product.brand.id,
          category: product.model.category,
          createAt: product.model.createAt,
          title: product.model.title,
          updateAt: product.model.updateAt,
        },
        name: product.name,
        description: product.description,
        releaseDate: product.releaseDate,
        createAt: product.createAt,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        updateAt: product.updateAt,
        specifications: product.specifications,
        visibleOnStore: product.visibleOnStore,
        recommended: product.recommended,
        tags: product.tags,
        variants: product.variants,
      }),
      product
    );
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepo.updateProduct(id, dto);
    return this.createResponseData<ProductResponseDto>(
      (product: ProductEntity) => ({
        id: product.id,
        brand: {
          id: product.brand.id,
          title: product.brand.title,
          createAt: product.brand.createAt,
          updateAt: product.brand.updateAt,
        },
        category: product.category,
        model: {
          id: product.model.id,
          brandId: product.brand.id,
          category: product.model.category,
          createAt: product.model.createAt,
          title: product.model.title,
          updateAt: product.model.updateAt,
        },
        name: product.name,
        description: product.description,
        releaseDate: product.releaseDate,
        createAt: product.createAt,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        visibleOnStore: product.visibleOnStore,
        recommended: product.recommended,
        updateAt: product.updateAt,
        specifications: product.specifications,
        tags: product.tags,
        variants: product.variants,
      }),
      product
    );
  }

  async getProductById(id: number): Promise<ProductResponseDto> {
    const product = await this.productRepo.getProductById(id);
    return this.createResponseData<ProductResponseDto>(
      (product: ProductEntity) => ({
        id: product.id,
        brand: {
          id: product.brand.id,
          title: product.brand.title,
          createAt: product.brand.createAt,
          updateAt: product.brand.updateAt,
        },
        category: product.category,
        model: {
          id: product.model.id,
          brandId: product.brand.id,
          category: product.model.category,
          createAt: product.model.createAt,
          title: product.model.title,
          updateAt: product.model.updateAt,
        },
        name: product.name,
        description: product.description,
        releaseDate: product.releaseDate,
        createAt: product.createAt,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        updateAt: product.updateAt,
        visibleOnStore: product.visibleOnStore,
        recommended: product.recommended,
        specifications: product.specifications,
        tags: product.tags,
        variants: product.variants,
        images: product.images,
      }),
      product
    );
  }

  async getProducts(
    take: number,
    skip: number,
    searchTerm: string,
    category: string,
    brandId?: number,
    visibleOnStore?: boolean,
    recommended?: boolean
  ): Promise<{ productList: ProductEntity[]; totalItems: number }> {
    const result = await this.productRepo.getProducts(
      take,
      skip,
      searchTerm,
      category,
      brandId,
      visibleOnStore,
      recommended
    );
    let list = [];
    for (let i = 0; i < result.productList.length; i++) {
      let quantity = 0;
      let minPrice = result.productList[i].variants.length > 0 ? result.productList[i].variants[0].basePrice : 0;
      let MaxPrice = 0;
      if (result.productList[i].variants.length > 0) {
        for (let j = 0; j < result.productList[i].variants.length; j++) {
          quantity += result.productList[i].variants[j].quantity;
          if (+result.productList[i].variants[j].basePrice < minPrice)
            minPrice = result.productList[i].variants[j].basePrice;
          else if (+result.productList[i].variants[j].basePrice >= MaxPrice)
            MaxPrice = result.productList[i].variants[j].basePrice;
        }
      }
      let price = `${minPrice}-${MaxPrice}`;
      if (visibleOnStore == true && quantity > 0) {
        list.push(
          this.createResponseData<ProductListDto>(
            (product: ProductEntity, quantity: number, price: string) => ({
              id: product.id,
              brand: {
                id: product.brand.id,
                title: product.brand.title,
                createAt: product.brand.createAt,
                updateAt: product.brand.updateAt,
              },
              model: {
                id: product.model.id,
                brandId: product.brand.id,
                category: product.model.category,
                createAt: product.model.createAt,
                title: product.model.title,
                updateAt: product.model.updateAt,
              },
              category: product.category,
              name: product.name,
              createAt: product.createAt,
              updateAt: product.updateAt,
              price,
              quantity,
              visibleOnStore: product.visibleOnStore,
              recommended: product.recommended,
              images: product.images,
            }),
            result.productList[i],
            quantity,
            price
          )
        );
      } else if (visibleOnStore == false && quantity == 0) {
        list.push(
          this.createResponseData<ProductListDto>(
            (product: ProductEntity, quantity: number, price: string) => ({
              id: product.id,
              brand: {
                id: product.brand.id,
                title: product.brand.title,
                createAt: product.brand.createAt,
                updateAt: product.brand.updateAt,
              },
              model: {
                id: product.model.id,
                brandId: product.brand.id,
                category: product.model.category,
                createAt: product.model.createAt,
                title: product.model.title,
                updateAt: product.model.updateAt,
              },
              category: product.category,
              name: product.name,
              createAt: product.createAt,
              updateAt: product.updateAt,
              price,
              quantity,
              visibleOnStore: product.visibleOnStore,
              recommended: product.recommended,
              images: product.images,
            }),
            result.productList[i],
            quantity,
            price
          )
        );
      } else {
        list.push(
          this.createResponseData<ProductListDto>(
            (product: ProductEntity, quantity: number, price: string) => ({
              id: product.id,
              brand: {
                id: product.brand.id,
                title: product.brand.title,
                createAt: product.brand.createAt,
                updateAt: product.brand.updateAt,
              },
              model: {
                id: product.model.id,
                brandId: product.brand.id,
                category: product.model.category,
                createAt: product.model.createAt,
                title: product.model.title,
                updateAt: product.model.updateAt,
              },
              category: product.category,
              name: product.name,
              createAt: product.createAt,
              updateAt: product.updateAt,
              price,
              quantity,
              visibleOnStore: product.visibleOnStore,
              recommended: product.recommended,
              images: product.images,
            }),
            result.productList[i],
            quantity,
            price
          )
        );
      }
    }
    return { productList: list, totalItems: result.totalItems };
  }

  async deleteProduct(id: number): Promise<void> {
    await this.productRepo.softDeleteProduct(id);
  }

  // Specification Operations
  async addSpecification(productId: number, dto: CreateSpecificationDto) {
    return await this.productRepo.addSpecification(productId, dto);
  }

  async updateSpecification(productId: number, id: number, dto: UpdateSpecificationDto) {
    return await this.productRepo.updateSpecification(productId, id, dto);
  }

  async getProductSpecifications(productId: number) {
    return await this.productRepo.getProductSpecifications(productId);
  }

  async deleteSpecificationAttribute(productId: number, specId: number, id: number): Promise<void> {
    await this.productRepo.softDeleteSpecificationAttribute(productId, specId, id);
  }

  async deleteSpecification(productId: number, id: number): Promise<void> {
    await this.productRepo.softDeleteSpecification(productId, id);
  }

  // Variant Operations
  async addVariant(productId: number, dto: CreateVariantDto) {
    return await this.productRepo.addVariant(productId, dto);
  }

  async updateVariant(id: number, productId: number, dto: UpdateVariantDto) {
    return await this.productRepo.updateVariant(id, productId, dto);
  }

  async getProductVariants(productId: number) {
    return await this.productRepo.getProductVariants(productId);
  }

  async getProductVariantDetails(productId: number, id: number) {
    return await this.productRepo.getVariantById(productId, id);
  }

  async deleteVariant(id: number, productId: number): Promise<void> {
    await this.productRepo.removeVariant(id, productId);
  }

  // Tag Operations
  async addTag(productId: number, dto: CreateTagDto) {
    return this.productRepo.addTag(productId, dto);
  }

  async removeTag(productId: number, id: number): Promise<void> {
    await this.productRepo.removeTag(productId, id);
  }

  // Brand & Model Operations
  async createBrand(dto: CreateBrandDto): Promise<BrandResponseDto> {
    const brand = await this.productRepo.createBrand(dto);
    return this.createResponseData<BrandResponseDto>(
      (brand: BrandEntity) => ({
        id: brand.id,
        title: brand.title,
        createAt: brand.createAt,
        updateAt: brand.updateAt,
      }),
      brand
    );
  }

  async getBrandWithModels(brandId: number): Promise<BrandResponseDto> {
    const brand = await this.productRepo.getBrandWithModels(brandId);
    return this.createResponseData<BrandResponseDto>(
      (brand: BrandEntity) => ({
        models: brand.models,
        id: brand.id,
        createAt: brand.createAt,
        updateAt: brand.updateAt,
        title: brand.title,
      }),
      brand
    );
  }

  async createColor(dto: CreateColorDto): Promise<ColorResponseDto> {
    const color = await this.productRepo.createColor(dto);
    return this.createResponseData<ColorResponseDto>(
      (brand: BrandEntity) => ({
        id: brand.id,
        title: brand.title,
        createAt: brand.createAt,
        updateAt: brand.updateAt,
      }),
      color
    );
  }

  async getColors() {
    return await this.productRepo.getColors();
  }

  async deleteColorById(colorId: number, admin: AdminEntity) {
    return await this.productRepo.deleteColor(colorId);
  }

  async createModel(brandId: number, dto: CreateModelDto): Promise<ModelResponseDto> {
    const model = await this.productRepo.createModel(brandId, dto);
    return this.createResponseData<ModelResponseDto>(
      (model: ModelEntity) => ({
        brandId: model.brand.id,
        category: model.category,
        id: model.id,
        title: model.title,
        createAt: model.createAt,
        updateAt: model.updateAt,
      }),
      model
    );
  }

  async getBrands() {
    return await this.productRepo.getBrands();
  }

  async deleteBrandById(brandId: number, admin: AdminEntity) {
    return await this.productRepo.deleteBrand(brandId);
  }

  async deleteModelById(brandId: number, modelId: number) {
    return await this.productRepo.deleteModelByBrandId(brandId, modelId);
  }
}
