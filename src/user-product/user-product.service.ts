import { Injectable } from "@nestjs/common";
import { ProductResponseDto } from "../admin-product/dto/product.response.dto";
import { ProductEntity } from "../admin-product/entity/product.entity";
import { ProductRepository } from "../admin-product/repository/product.repository";

@Injectable()
export class UserProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  private createResponseData<T>(mapper: (...args: any[]) => T, ...args: any[]): T {
    return mapper(...args);
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
        specifications: product.specifications,
        visibleOnStore: product.visibleOnStore,
        recommended: product.recommended,
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
    condition?: string,
    storage?: string,
    sortBy?: string,
    minPrice?: number,
    maxPrice?: number,
    discount?: boolean,
    visibleOnStore?: boolean,
    recommended?: boolean
  ): Promise<{ productList: ProductEntity[]; totalItems: number }> {
    const result = await this.productRepo.getProductsUser(
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
    );

    let list = [];
    for (let i = 0; i < result.productList.length; i++) {
      list.push(
        this.createResponseData<ProductResponseDto>(
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
            images: product.images,
          }),
          result.productList[i]
        )
      );
    }
    return { productList: list, totalItems: result.totalItems };
  }
}
