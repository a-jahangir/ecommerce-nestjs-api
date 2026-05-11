import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { MyLocalBaseEntity } from "../../shared/entity/base.local.entity";
import { ProductEntity } from "./product.entity";
import { SpecificationAttributeEntity } from "./specification.attribute.entity";

@Entity("product_specification")
export class ProductSpecificationEntity extends MyLocalBaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @ManyToOne(() => ProductEntity, (product) => product.specifications)
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @OneToMany(() => SpecificationAttributeEntity, (attr) => attr.productSpecification)
  attributes: SpecificationAttributeEntity[];
}
