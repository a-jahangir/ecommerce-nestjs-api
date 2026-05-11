// src/models/entities/model.entity.ts
import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";
import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { CategoryEnum } from "../enum/category.enum";
import { BrandEntity } from "./brand.entity";
import { ProductEntity } from "./product.entity";

@Entity("model")
export class ModelEntity extends MyLocalBaseEntity {
  @Column({
    type: "enum",
    enum: CategoryEnum,
    nullable: false,
  })
  category: CategoryEnum;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  title: string;

  @ManyToOne(() => BrandEntity, (brand) => brand.models)
  brand: BrandEntity;

  @OneToMany(() => ProductEntity, (product) => product.model)
  products: ProductEntity[];
}
