// src/brands/entities/brand.entity.ts
import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";
import { Entity, Column, OneToMany } from "typeorm";
import { ModelEntity } from "./model.entity";
import { ProductEntity } from "./product.entity";

@Entity("brand")
export class BrandEntity extends MyLocalBaseEntity {
  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  title: string;

  @OneToMany(() => ModelEntity, (model) => model.brand)
  models: ModelEntity[];

  @OneToMany(() => ProductEntity, (product) => product.brand)
  products: ProductEntity[];
}
