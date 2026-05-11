import { Column, Entity, OneToMany } from "typeorm";
import { myBaseEntity } from "../../shared/entity/base.entity";

@Entity("admin")
export class AdminEntity extends myBaseEntity {
  @Column()
  email: string;

  @Column({
    name: "hash_password",
    nullable: false,
  })
  hashPassword: string;
}
