import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { OrderDetailsEntity } from "./order.details.entity";
import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";

@Entity("order")
export class OrderEntity extends MyLocalBaseEntity {
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false, name: "price" })
  price: number;

  @Column({
    nullable: true,
    name: "discount",
  })
  discount?: string;

  @Column({
    nullable: true,
    name: "orderNumber",
  })
  orderNumber?: string;

  @Column({ name: "user_address", type: "varchar", length: 255, nullable: true })
  userAddress?: string;

  @Column({ name: "user_postalcode", type: "varchar", length: 255, nullable: true })
  userPostalCode?: string;

  @Column({ name: "user_email", type: "varchar", length: 255, nullable: true })
  userEmail?: string;

  @Column({ name: "user_number", type: "varchar", length: 255, nullable: true })
  phoneNumber?: string;

  @Column({ name: "user_country", type: "varchar", length: 255, nullable: true })
  countryName?: string;

  @Column({ name: "user_first_name", type: "varchar", length: 255, nullable: true })
  userFirstName?: string;

  @Column({ name: "user_last_name", type: "varchar", length: 255, nullable: true })
  userLastName?: string;

  @Column({
    nullable: true,
    name: "shipment_url",
  })
  shipmentURL?: string;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column()
  status: string;

  @OneToMany(() => OrderDetailsEntity, (orderDetails) => orderDetails.order)
  details: OrderDetailsEntity[];

  @Column({
    type: "timestamptz",
    nullable: true,
    name: "paid_at",
  })
  paidAt?: Date;
}
