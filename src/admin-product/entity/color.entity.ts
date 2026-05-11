import { MyLocalBaseEntity } from "src/shared/entity/base.local.entity";
import { Entity, Column } from "typeorm";

@Entity("color")
export class ColorEntity extends MyLocalBaseEntity {
  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  title: string;
}
