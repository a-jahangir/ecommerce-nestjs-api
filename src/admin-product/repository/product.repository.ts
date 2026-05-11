// src/products/repositories/product.repository.ts
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, ILike, Brackets, SelectQueryBuilder } from "typeorm";
import { ProductEntity } from "../entity/product.entity";
import { ProductSpecificationEntity } from "../entity/product.spicification.entity";
import { SpecificationAttributeEntity } from "../entity/specification.attribute.entity";
import { ProductTagEntity } from "../entity/product.tag.entity";
import { ProductVariantEntity } from "../entity/product.variant.entity";
import { BrandEntity } from "../entity/brand.entity";
import { ModelEntity } from "../entity/model.entity";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { CreateSpecificationDto } from "../dto/creaete-specification.dto";
import { CreateVariantDto } from "../dto/create-variant.dto";
import { UpdateSpecificationDto } from "../dto/update-specification.dto";
import { UpdateVariantDto } from "../dto/update-variant.dto";
import { CreateTagDto } from "../dto/create-tag.dto";
import { CreateBrandDto } from "../dto/create-brand.dto";
import { UpdateBrandDto } from "../dto/update-brand.dto";
import { CreateModelDto } from "../dto/create-model.dto";
import { UpdateModelDto } from "../dto/update-model.dto";
import { CategoryEnum } from "../enum/category.enum";
import { ConditionEnum } from "../enum/condition.enum";
import { StorageEnum } from "../enum/storage.enum";
import { ProductImageEntity } from "../entity/product.images.entity";
import { ColorEntity } from "../entity/color.entity";
import { CreateColorDto } from "../dto/create-color.dto";

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductSpecificationEntity)
    private readonly specRepo: Repository<ProductSpecificationEntity>,
    @InjectRepository(SpecificationAttributeEntity)
    private readonly attrRepo: Repository<SpecificationAttributeEntity>,
    @InjectRepository(ProductTagEntity)
    private readonly tagRepo: Repository<ProductTagEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
    @InjectRepository(ModelEntity)
    private readonly modelRepo: Repository<ModelEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepo: Repository<ProductImageEntity>,
    @InjectRepository(ColorEntity)
    private readonly colorRepo: Repository<ColorEntity>
  ) {}

  private isValueInEnum<T extends Record<string, unknown>>(enumObj: T, value: unknown): boolean {
    return Object.values(enumObj).includes(value as T[keyof T]);
  }

  // Product Operations
  async createProduct(dto: CreateProductDto): Promise<ProductEntity> {
    const { brandId, category, modelId, name, description, metaDescription, metaTitle, releaseDate } = dto;
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    const model = await this.modelRepo.findOne({ where: { id: modelId } });
    if (brand && model && model.category == category && this.isValueInEnum(CategoryEnum, category)) {
      let product = new ProductEntity();
      product.name = name;
      product.description = description;
      product.brand = brand;
      product.model = model;
      product.category = category;
      product.metaTitle = metaTitle;
      product.metaDescription = metaDescription;
      product.releaseDate = releaseDate;
      product.visibleOnStore = dto.visibleOnStore;
      product.recommended = dto.recommended;
      product = await this.productRepo.save(product);
      for (let i = 0; i < dto.files.length; i++) {
        const productImage = new ProductImageEntity();
        productImage.filePath = dto.files[i].path;
        productImage.index = dto.files[i].index;
        productImage.product = product;
        await this.productImageRepo.save(productImage);
      }
      return product;
    }
    throw new BadRequestException("BAD_REQUEST");
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    let product = await this.productRepo.findOne({ where: { id }, relations: ["images"] });
    if (product) {
      if (dto.brandId) {
        const brand = await this.brandRepo.findOne({ where: { id: dto.brandId } });
        if (brand) product.brand = brand;
      }
      if (dto.modelId) {
        const model = await this.modelRepo.findOne({ where: { id: dto.modelId } });
        if (model) product.model = model;
      }
      if (
        dto.category &&
        this.isValueInEnum(CategoryEnum, dto.category)
        // && product.model.category == dto.category      // category can update now
      )
        product.category = dto.category;
      if (dto.name !== undefined) product.name = dto.name;
      if (dto.description !== undefined) product.description = dto.description;
      if (dto.metaTitle !== undefined) product.metaTitle = dto.metaTitle;
      if (dto.metaDescription !== undefined) product.metaDescription = dto.metaDescription;
      if (dto.releaseDate !== undefined) product.releaseDate = dto.releaseDate;
      if (dto.visibleOnStore !== undefined) product.visibleOnStore = dto.visibleOnStore;
      if (dto.recommended !== undefined) product.recommended = dto.recommended;

      let newImages = [];
      if (dto.files && dto.files.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          product.images[i].deleteAt = new Date();
        }
        for (let i = 0; i < dto.files.length; i++) {
          const productImage = new ProductImageEntity();
          productImage.filePath = dto.files[i].path;
          productImage.index = dto.files[i].index;
          productImage.product = product;
          // product.images.push(productImage);
          newImages.push(productImage);
          // await this.productImageRepo.save(productImage);
        }
        product.images = newImages;
      }

      await this.productImageRepo.save(product.images);
      product = await this.productRepo.save(product);
      this.productImageRepo.save(newImages);
      return product;
    }
    throw new BadRequestException("BAD_REQUEST");
  }

  async getProductById(id: number): Promise<ProductEntity> {
    const product = await this.productRepo.findOne({
      where: { id, deleteAt: IsNull() },
      relations: ["brand", "model", "specifications", "specifications.attributes", "tags", "variants", "images"],
      order: {
        createAt: "ASC",
        variants: {
          createAt: "DESC",
        },
        specifications: {
          createAt: "ASC",
        },
      },
    });
    if (product) return product;
    throw new NotFoundException();
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
    const queryBuilder = this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoinAndSelect("product.model", "model")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("product.images", "images")
      .orderBy("product.images", "DESC")
      .skip(skip)
      .take(take)
      .orderBy("product.createAt", "DESC");

    if (brandId) {
      queryBuilder.andWhere("product.brandId = :brandId", { brandId });
    }

    if (category && this.isValueInEnum(CategoryEnum, category)) {
      queryBuilder.andWhere("product.category = :category", { category });
    }

    if (searchTerm) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("product.name ILIKE :searchTerm", { searchTerm: `%${searchTerm}%` }).orWhere(
            "variants.SKU ILIKE :searchTerm",
            { searchTerm: `%${searchTerm}%` }
          );
        })
      );
    }

    if (visibleOnStore !== undefined) {
      queryBuilder.andWhere("product.visibleOnStore = :visibleOnStore", { visibleOnStore });
    }

    if (recommended !== undefined) {
      queryBuilder.andWhere("product.recommended = :recommended", { recommended });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { productList: data, totalItems: total };
  }

  async getProductsUser(
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
    // Handle best-sellers separately due to complex aggregation
    if (sortBy === "best-sellers") {
      return this.getBestSellersProducts(
        take,
        skip,
        searchTerm,
        category,
        brandId,
        condition,
        storage,
        minPrice,
        maxPrice,
        discount,
        visibleOnStore,
        recommended
      );
    }

    const queryBuilder = this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoinAndSelect("product.model", "model")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("product.images", "images")
      .skip(skip)
      .take(take);

    // Filter out products with no variants
    queryBuilder.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select("1")
        .from(ProductVariantEntity, "pv")
        .where("pv.productId = product.id")
        .getQuery();
      return `EXISTS (${subQuery})`;
    });

    // Apply all filters
    this.applyCommonFilters(queryBuilder, {
      brandId,
      category,
      searchTerm,
      condition,
      storage,
      minPrice,
      maxPrice,
      discount,
      visibleOnStore,
      recommended,
    });

    // Apply sorting (excluding best-sellers)
    this.applySorting(queryBuilder, sortBy);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Additional client-side filtering to ensure no products with empty variants array
    const filteredData = data.filter((product) => product.variants && product.variants.length > 0);

    return {
      productList: filteredData,
      totalItems: total - (data.length - filteredData.length),
    };
  }

  private async getBestSellersProducts(
    take: number,
    skip: number,
    searchTerm: string,
    category: string,
    brandId?: number,
    condition?: string,
    storage?: string,
    minPrice?: number,
    maxPrice?: number,
    discount?: boolean,
    visibleOnStore?: boolean,
    recommended?: boolean
  ): Promise<{ productList: ProductEntity[]; totalItems: number }> {
    const queryBuilder = this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoinAndSelect("product.model", "model")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("product.images", "images")
      .leftJoin("product.variants", "sort_variants")
      .leftJoin("sort_variants.orders", "orders")
      .addSelect("COUNT(DISTINCT orders.id)", "order_count")
      .groupBy("product.id, brand.id, model.id, variants.id, images.id")
      .orderBy("order_count", "DESC")
      .skip(skip)
      .take(take);

    // Apply all filters
    this.applyCommonFilters(queryBuilder, {
      brandId,
      category,
      searchTerm,
      condition,
      storage,
      minPrice,
      maxPrice,
      discount,
      visibleOnStore,
      recommended,
    });

    const [data, total] = await queryBuilder.getManyAndCount();

    const filteredData = data.filter((product) => product.variants && product.variants.length > 0);

    return {
      productList: filteredData,
      totalItems: total - (data.length - filteredData.length),
    };
  }

  private applyCommonFilters(
    queryBuilder: SelectQueryBuilder<ProductEntity>,
    filters: {
      brandId?: number;
      category?: string;
      searchTerm?: string;
      condition?: string;
      storage?: string;
      minPrice?: number;
      maxPrice?: number;
      discount?: boolean;
      visibleOnStore?: boolean;
      recommended?: boolean;
    }
  ): void {
    const {
      brandId,
      category,
      searchTerm,
      condition,
      storage,
      minPrice,
      maxPrice,
      discount,
      visibleOnStore,
      recommended,
    } = filters;

    // Brand filter
    if (brandId) {
      queryBuilder.andWhere("product.brandId = :brandId", { brandId });
    }

    // Category filter
    if (category && this.isValueInEnum(CategoryEnum, category)) {
      queryBuilder.andWhere("product.category = :category", { category });
    }

    // Search term filter
    if (searchTerm) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("product.name ILIKE :searchTerm", { searchTerm: `%${searchTerm}%` }).orWhere(
            "variants.SKU ILIKE :searchTerm",
            { searchTerm: `%${searchTerm}%` }
          );
        })
      );
    }

    // Condition filter
    if (condition && this.isValueInEnum(ConditionEnum, condition)) {
      queryBuilder
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("1")
            .from(ProductVariantEntity, "pv")
            .where("pv.productId = product.id")
            .andWhere("pv.condition = :condition")
            .getQuery();
          return `EXISTS (${subQuery})`;
        })
        .setParameter("condition", condition);
    }

    // Storage filter
    if (storage && this.isValueInEnum(StorageEnum, storage)) {
      queryBuilder
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("1")
            .from(ProductVariantEntity, "pv")
            .where("pv.productId = product.id")
            .andWhere("pv.storage = :storage")
            .getQuery();
          return `EXISTS (${subQuery})`;
        })
        .setParameter("storage", storage);
    }

    // Price range filter
    if (minPrice !== undefined && maxPrice !== undefined && minPrice <= maxPrice) {
      queryBuilder
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("1")
            .from(ProductVariantEntity, "pv")
            .where("pv.productId = product.id")
            .andWhere("pv.basePrice BETWEEN :minPrice AND :maxPrice")
            .getQuery();
          return `EXISTS (${subQuery})`;
        })
        .setParameters({ minPrice, maxPrice });
    }

    // Discount filter
    if (discount !== undefined) {
      const condition = discount ? "pv.discount > 0" : "pv.discount = 0";
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("1")
          .from(ProductVariantEntity, "pv")
          .where("pv.productId = product.id")
          .andWhere(condition)
          .getQuery();
        return `EXISTS (${subQuery})`;
      });
    }

    // Visibility filter
    if (visibleOnStore !== undefined) {
      queryBuilder.andWhere("product.visibleOnStore = :visibleOnStore", { visibleOnStore });
    }

    // Recommended filter
    if (recommended !== undefined) {
      queryBuilder.andWhere("product.recommended = :recommended", { recommended });
    }
  }

  private applySorting(queryBuilder: SelectQueryBuilder<ProductEntity>, sortBy?: string): void {
    switch (sortBy) {
      case "price-low-to-high":
        queryBuilder
          .leftJoin("product.variants", "price_variants")
          .addSelect("MIN(price_variants.basePrice)", "min_price")
          .groupBy("product.id, brand.id, model.id, variants.id, images.id")
          .orderBy("min_price", "ASC");
        break;

      case "price-high-to-low":
        queryBuilder
          .leftJoin("product.variants", "price_variants")
          .addSelect("MAX(price_variants.basePrice)", "max_price")
          .groupBy("product.id, brand.id, model.id, variants.id, images.id")
          .orderBy("max_price", "DESC");
        break;

      case "discount":
        queryBuilder
          .leftJoin("product.variants", "discount_variants")
          .addSelect("MAX(discount_variants.discount)", "max_discount")
          .groupBy("product.id, brand.id, model.id, variants.id, images.id")
          .orderBy("max_discount", "DESC");
        break;

      case "latest":
      default:
        queryBuilder.orderBy("product.createAt", "DESC");
        break;
    }
  }

  async softDeleteProduct(id: number): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id, deleteAt: IsNull() },
    });
    if (!product) throw new BadRequestException("NOT_FOUND");
    product.deleteAt = new Date();
    await this.productRepo.save(product);
  }

  async addSpecification(productId: number, dto: CreateSpecificationDto): Promise<ProductSpecificationEntity> {
    const product = await this.getProductById(productId);
    if (product) {
      const { attributes, title } = dto;
      let spec = new ProductSpecificationEntity();
      spec.title = title;
      spec.product = product;
      spec.attributes = [];
      spec = await this.specRepo.save(spec);

      for (let i = 0; i < attributes.length; i++) {
        const { title, value } = attributes[i];
        let attr = new SpecificationAttributeEntity();
        attr.productSpecification = spec;
        attr.title = title;
        attr.value = value;
        attr = await this.attrRepo.save(attr);
        spec.attributes.push(attr);
      }
      return await this.getSpecificationById(spec.id);
    }
    throw new NotFoundException();
  }

  async updateSpecification(
    productId: number,
    id: number,
    dto: UpdateSpecificationDto
  ): Promise<ProductSpecificationEntity> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (product) {
      const spec = await this.specRepo.findOne({ where: { id: id } });
      if (spec) {
        if (dto.title) spec.title = dto.title;
        spec.attributes = [];
        for (let i = 0; i < dto.attributes.length; i++) {
          let attr = new SpecificationAttributeEntity();
          attr.productSpecification = spec;
          attr.title = dto.attributes[i].title;
          attr.value = dto.attributes[i].value;
          attr = await this.attrRepo.save(attr);
          spec.attributes.push(attr);
        }
        await this.specRepo.save(spec);
        return await this.getSpecificationById(spec.id);
      }
      throw new BadRequestException();
    }
    throw new NotFoundException();
  }

  async getSpecificationById(id: number): Promise<ProductSpecificationEntity> {
    return this.specRepo.findOneOrFail({
      where: { id, deleteAt: IsNull() },
      relations: ["attributes"],
    });
  }

  async getProductSpecifications(productId: number): Promise<ProductSpecificationEntity[]> {
    const product = await this.getProductById(productId);
    if (product) {
      return this.specRepo.find({
        where: { product: { id: productId }, deleteAt: IsNull() },
        relations: ["attributes"],
        order: { createAt: "DESC" },
      });
    }
    throw new NotFoundException();
  }

  async softDeleteSpecificationAttribute(productId: number, specId: number, id: number): Promise<void> {
    const product = await this.getProductById(productId);
    if (product) {
      const spec = await this.specRepo.findOne({
        where: { id: specId },
      });
      if (spec) {
        const attributes = await this.attrRepo.find({ where: { id } });
        for (let i = 0; i < attributes.length; i++) {
          if (attributes[i].id == id) {
            attributes[i].deleteAt = new Date();
            await this.attrRepo.save(attributes[i]);
          }
        }
      } else throw new BadRequestException();
    } else throw new NotFoundException();
  }

  async softDeleteSpecification(productId: number, id: number): Promise<void> {
    const product = await this.getProductById(productId);
    if (product) {
      const spec = await this.specRepo.findOne({ where: { id }, relations: ["attributes"] });
      if (spec) {
        spec.deleteAt = new Date();
        await this.specRepo.save(spec);
      } else throw new BadRequestException();
    } else throw new NotFoundException();
  }

  // Variant Operations
  async addVariant(productId: number, dto: CreateVariantDto): Promise<ProductVariantEntity> {
    const product = await this.getProductById(productId);
    if (product) {
      const {
        SKU,
        basePrice,
        condition,
        quantity,
        storage,
        altText,
        brandNewPrice,
        discount,
        filePath,
        hasAdapter,
        hasAirPod,
        hasChargingCable,
        hasSIMTray,
        primary,
        colorId,
      } = dto;
      if (primary === true) {
        for (let i = 0; i < product.variants.length; i++) {
          if (product.variants[i].primary === true) {
            product.variants[i].primary = false;
            await this.variantRepo.save(product.variants[i]);
          }
        }
      }
      const variant = new ProductVariantEntity();
      if (SKU) {
        const existSKU = await this.variantRepo.findOne({ where: { SKU } });
        if (!existSKU) variant.SKU = SKU;
        else throw new BadRequestException();
      }
      if (altText) variant.altText = altText;
      if (basePrice > 0) variant.basePrice = basePrice;
      else throw new BadRequestException();
      if (brandNewPrice > 0) variant.brandNewPrice = brandNewPrice;
      else throw new BadRequestException();
      if (discount) variant.discount = discount;
      if (this.isValueInEnum(ConditionEnum, condition)) variant.condition = condition;
      else throw new BadRequestException();
      variant.quantity = quantity;
      if (this.isValueInEnum(StorageEnum, storage)) variant.storage = storage;
      else throw new BadRequestException();
      if (filePath) variant.filePath = filePath;
      variant.hasAdapter = hasAdapter;
      variant.hasAirPod = hasAirPod;
      variant.hasChargingCable = hasChargingCable;
      variant.hasSIMTray = hasSIMTray;
      variant.primary = primary;
      variant.product = product;
      const color = await this.colorRepo.findOne({ where: { id: colorId } });
      if (color) {
        variant.color = color.title;
        return await this.variantRepo.save(variant);
      } else throw new BadRequestException();
    }
    throw new NotFoundException();
  }

  async updateVariant(id: number, productId: number, dto: UpdateVariantDto): Promise<ProductVariantEntity> {
    const product = await this.getProductById(productId);
    if (!product) throw new NotFoundException("Product not found");

    const variant = await this.variantRepo.findOne({ where: { id } });
    if (!variant) throw new NotFoundException("Variant not found");

    if (dto.primary === true) {
      await Promise.all(
        product.variants
          .filter((v) => v.primary === true && v.id !== id)
          .map(async (v) => {
            v.primary = false;
            return this.variantRepo.save(v);
          })
      );
    }

    const updates: Partial<ProductVariantEntity> = {};

    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined) {
        if (key === "condition" && !this.isValueInEnum(ConditionEnum, dto[key])) return;
        if (key === "storage" && !this.isValueInEnum(StorageEnum, dto[key])) return;
        updates[key] = dto[key];
      }
    });

    Object.assign(variant, updates);
    return await this.variantRepo.save(variant);
  }

  async getProductVariants(productId: number): Promise<ProductVariantEntity[]> {
    const product = await this.getProductById(productId);
    if (product) {
      return await this.variantRepo.find({
        where: { product: { id: product.id }, deleteAt: IsNull() },
        order: { createAt: "DESC" },
      });
    }
    throw new NotFoundException();
  }

  async getVariantById(productId: number, id: number): Promise<ProductVariantEntity> {
    const product = await this.getProductById(productId);
    if (product) {
      const variant = await this.variantRepo.findOne({ where: { id }, relations: ["product"] });
      if (variant) return variant;
      throw new NotFoundException();
    }
    throw new NotFoundException();
  }

  async removeVariant(id: number, productId: number): Promise<void> {
    const product = await this.getProductById(productId);
    if (product) {
      const variant = await this.variantRepo.findOne({ where: { id } });
      if (variant) {
        variant.deleteAt = new Date();
        await this.variantRepo.save(variant);
      } else throw new BadRequestException();
    } else throw new NotFoundException();
  }

  // Tag Operations
  async addTag(productId: number, dto: CreateTagDto): Promise<ProductEntity> {
    const product = await this.getProductById(productId);
    if (product) {
      for (let i = 0; i < dto.values.length; i++) {
        let tag = new ProductTagEntity();
        tag.value = dto.values[i];
        tag.product = product;
        tag = await this.tagRepo.save(tag);
      }
      return product;
    }
    throw new NotFoundException();
  }

  async removeTag(productId: number, id: number): Promise<void> {
    const product = await this.getProductById(productId);
    if (product) {
      const tag = await this.tagRepo.findOne({ where: { id } });
      if (tag) {
        tag.deleteAt = new Date();
        await this.tagRepo.save(tag);
      } else throw new BadRequestException();
    } else throw new NotFoundException();
  }

  // Brand & Model Operations
  async addBrandToModel(modelId: number, dto: CreateBrandDto): Promise<BrandEntity> {
    const brand = this.brandRepo.create(dto);
    const model = await this.modelRepo.findOneByOrFail({ id: modelId });
    brand.models = [model];
    return await this.brandRepo.save(brand);
  }

  async removeBrandFromModel(brandId: number, modelId: number): Promise<void> {
    const brand = await this.brandRepo.findOne({
      where: { id: brandId },
      relations: ["models"],
    });

    brand.models = brand.models.filter((model) => model.id !== modelId);
    await this.brandRepo.save(brand);
  }

  // BRAND OPERATIONS
  async createBrand(dto: CreateBrandDto): Promise<BrandEntity> {
    const existBrand = await this.brandRepo.findOne({ where: { title: dto.title } });
    if (existBrand) throw new BadRequestException();
    const newBrand = new BrandEntity();
    newBrand.title = dto.title;
    return await this.brandRepo.save(newBrand);
  }

  async getBrandWithModels(brandId: number): Promise<BrandEntity> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId }, relations: ["models"] });
    if (brand) return brand;
    throw new NotFoundException();
  }

  async updateBrand(brandId: number, dto: UpdateBrandDto): Promise<BrandEntity> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (brand) {
      if (dto.title) brand.title = dto.title;
      return await this.brandRepo.save(brand);
    }
    throw new NotFoundException();
  }

  async deleteBrand(brandId: number): Promise<BrandEntity> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId }, relations: ["products"] });
    if (brand.products.length > 0) throw new BadRequestException("BAD_REQUEST");
    brand.deleteAt = new Date();
    return await this.brandRepo.save(brand);
  }

  // MODEL OPERATIONS
  async createModel(brandId: number, dto: CreateModelDto): Promise<ModelEntity> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (brand) {
      const models = await this.modelRepo.find({ where: { brand } });
      for (let i = 0; i < models.length; i++) {
        if (models[i].title == dto.title && models[i].category == dto.category) throw new BadRequestException();
      }
      const newModel = new ModelEntity();
      newModel.brand = brand;
      if (this.isValueInEnum(CategoryEnum, dto.category)) newModel.category = dto.category;
      newModel.title = dto.title;
      return await this.modelRepo.save(newModel);
    }
    throw new NotFoundException();
  }

  async updateModel(modelId: number, dto: UpdateModelDto): Promise<ModelEntity> {
    await this.modelRepo.update(modelId, dto);
    return this.modelRepo.findOneByOrFail({ id: modelId });
  }

  async deleteModelByBrandId(brandId: number, modelId: number): Promise<ModelEntity> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId }, relations: ["models"] });
    if (brand) {
      const model = await this.modelRepo.findOne({ where: { id: modelId }, relations: ["products"] });
      if (model.products.length > 0) throw new BadRequestException("BAD_REQUEST");
      model.deleteAt = new Date();
      return await this.modelRepo.save(model);
    }
    throw new NotFoundException();
  }

  async getBrands() {
    return await this.brandRepo.find({ select: ["title", "id"], order: { title: "ASC" } });
  }

  // async deleteBrandById(brandId: number, admin: AdminEntity) {
  //   const brand = await this.brandRepo.findOne({where: {id: brandId},relations: ['']})
  // }

  async createColor(dto: CreateColorDto): Promise<ColorEntity> {
    const existColor = await this.colorRepo.findOne({ where: { title: dto.title } });
    if (existColor) throw new BadRequestException();
    const newColor = new ColorEntity();
    newColor.title = dto.title;
    return await this.colorRepo.save(newColor);
  }

  async updateColor(colorId: number, dto: UpdateBrandDto): Promise<ColorEntity> {
    const color = await this.colorRepo.findOne({ where: { id: colorId } });
    if (color) {
      if (dto.title) color.title = dto.title;
      return await this.colorRepo.save(color);
    }
    throw new NotFoundException();
  }

  async deleteColor(colorId: number): Promise<ColorEntity> {
    const color = await this.colorRepo.findOne({ where: { id: colorId } });
    color.deleteAt = new Date();
    return await this.colorRepo.save(color);
  }

  async getColors() {
    return await this.colorRepo.find({ order: { title: "ASC" } });
  }
}
