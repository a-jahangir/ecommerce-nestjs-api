import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ProductEntity } from "./product.entity";
import { StorageEnum } from "../enum/storage.enum";
import { ConditionEnum } from "../enum/condition.enum";
import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";
import { OrderDetailsEntity } from "src/user-order/entity/order.details.entity";

@Entity("product_variant")
export class ProductVariantEntity extends MyLocalBaseEntity {
  @ManyToOne(() => ProductEntity, (product) => product.variants)
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @Column({
    type: "enum",
    enum: StorageEnum,
    nullable: false,
  })
  storage: StorageEnum;

  @Column({
    type: "enum",
    enum: ConditionEnum,
    nullable: false,
  })
  condition: ConditionEnum;

  @Column({ type: "varchar", length: 255, nullable: true })
  filePath: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  color: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  altText: string;

  @Column({ type: "varchar", length: 100, nullable: false, unique: true })
  SKU: string;

  @Column({ type: "int", nullable: false, default: 0 })
  quantity: number;

  @Column({ type: "boolean", nullable: false, default: false })
  hasChargingCable: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  hasAdapter: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  hasAirPod: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  hasSIMTray: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  primary: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  basePrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  brandNewPrice: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  discount: number;

  @OneToMany(() => OrderDetailsEntity, (orderDetails) => orderDetails.order)
  orders: OrderDetailsEntity[];
}
