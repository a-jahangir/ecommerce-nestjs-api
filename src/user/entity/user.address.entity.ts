import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { myBaseEntity } from "../../shared/entity/base.entity";
import { UserEntity } from "./user.entity";
import { CountryEntity } from "src/baseinfo/entity/country.entity";

@Entity("user_address")
export class UserAddressEntity extends myBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.addresses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({
    nullable: false,
    name: "first_name",
  })
  firstName: string;

  @Column({
    nullable: false,
    name: "last_name",
  })
  lastName: string;

  @Column({
    nullable: false,
    name: "postal_code",
  })
  postalcode: string;

  @ManyToOne(() => CountryEntity, (country) => country.addresses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "country_id" })
  country: CountryEntity;

  @Column({
    nullable: false,
    name: "city",
  })
  city: string;

  @Column({
    nullable: false,
    name: "street_address",
  })
  streetAddress: string;

  @Column({
    nullable: false,
    name: "house_number",
  })
  houseNumber: string;

  @Column({
    nullable: false,
    name: "description",
  })
  description: string;

  @Column({
    nullable: false,
    name: "email",
  })
  email: string;

  @Column({
    nullable: false,
    name: "phone",
  })
  phone: string;
}
