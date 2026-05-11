import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";

@Entity("product_tag")
export class ProductTagEntity extends MyLocalBaseEntity {
  @ManyToOne(() => ProductEntity, (product) => product.tags)
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @Column({ type: "varchar", length: 255, nullable: false })
  value: string;
}
