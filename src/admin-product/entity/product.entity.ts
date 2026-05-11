import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { CategoryEnum } from "../enum/category.enum";
import { BrandEntity } from "./brand.entity";
import { ModelEntity } from "./model.entity";
import { ProductSpecificationEntity } from "./product.spicification.entity";
import { ProductTagEntity } from "./product.tag.entity";
import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";
import { ProductVariantEntity } from "./product.variant.entity";
import { ProductImageEntity } from "./product.images.entity";

@Entity("product")
export class ProductEntity extends MyLocalBaseEntity {
  @Column({
    type: "enum",
    enum: CategoryEnum,
    nullable: false,
    name: "category",
  })
  category: CategoryEnum;

  @Column({ type: "date", nullable: true })
  releaseDate: Date;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  metaDescription: string;

  @Column({ type: "boolean", nullable: false, default: false })
  visibleOnStore: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  recommended: boolean;

  @ManyToOne(() => BrandEntity, (brand) => brand.products)
  @JoinColumn({ name: "brandId" })
  brand: BrandEntity;

  @ManyToOne(() => ModelEntity, (model) => model.products)
  @JoinColumn({ name: "modelId" })
  model: ModelEntity;

  @OneToMany(() => ProductSpecificationEntity, (spec) => spec.product)
  specifications: ProductSpecificationEntity[];

  @OneToMany(() => ProductTagEntity, (tag) => tag.product)
  tags: ProductTagEntity[];

  @OneToMany(() => ProductVariantEntity, (tag) => tag.product)
  variants: ProductVariantEntity[];

  @OneToMany(() => ProductImageEntity, (image) => image.product)
  images: ProductImageEntity[];
}
