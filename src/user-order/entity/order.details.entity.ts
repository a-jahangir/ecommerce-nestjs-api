import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { OrderEntity } from "./order.entity";
import { MyLocalBaseEntity } from "../../shared/entity/base.local.entity";
import { ProductVariantEntity } from "../../admin-product/entity/product.variant.entity";
import { StorageEnum } from "src/admin-product/enum/storage.enum";
import { ConditionEnum } from "src/admin-product/enum/condition.enum";

@Entity("order_details")
export class OrderDetailsEntity extends MyLocalBaseEntity {
  @ManyToOne(() => OrderEntity, (order) => order.details, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: OrderEntity;

  @ManyToOne(() => ProductVariantEntity, (variant) => variant.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "variant_id" })
  variant: ProductVariantEntity;

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
}
