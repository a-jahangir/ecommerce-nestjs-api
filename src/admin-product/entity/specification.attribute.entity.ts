import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ProductSpecificationEntity } from "./product.spicification.entity";
import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";

@Entity("specification_attribute")
export class SpecificationAttributeEntity extends MyLocalBaseEntity {
  @ManyToOne(() => ProductSpecificationEntity, (spec) => spec.attributes)
  @JoinColumn({ name: "productSpecificationId" })
  productSpecification: ProductSpecificationEntity;

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  value: string;
}
