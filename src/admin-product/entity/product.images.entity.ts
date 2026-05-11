import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { ProductEntity } from "./product.entity";

@Entity("product_image")
export class ProductImageEntity extends MyLocalBaseEntity {
  @ManyToOne(() => ProductEntity, (brand) => brand.images)
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @Column({ name: "filePath" })
  filePath: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  index: number;
}
