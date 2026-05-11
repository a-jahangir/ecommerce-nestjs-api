import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { UserDeviceEntity } from "./user.device.entity";
import { UserProfileEntity } from "./user.profile.entity";
import { myBaseEntity } from "../../shared/entity/base.entity";
import { UserRoleEnum } from "../../shared/enum/user.role.enum";
import { UserRefreshTokenEntity } from "./user.refresh.token.entity";
import { UserAddressEntity } from "./user.address.entity";
import { OrderEntity } from "src/user-order/entity/order.entity";

@Entity("user")
export class UserEntity extends myBaseEntity {
  @Column({
    nullable: true,
    name: "first_name",
  })
  firstName?: string;

  @Column({
    name: "last_name",
    nullable: true,
  })
  lastName?: string;

  @Column({
    nullable: true,
    name: "password",
  })
  password?: string;

  @Column()
  email: string;

  @Column({
    nullable: true,
    name: "email_verified_at",
  })
  emailVerifiedAt?: Date;

  @Column({
    nullable: true,
    name: "two_factor_activated_at",
  })
  twoFactorActivatedAt?: Date;

  @Column({
    nullable: true,
    name: "registered_at",
  })
  registeredAt?: Date;

  @Column({
    nullable: true,
    name: "blocked_at",
  })
  blockedAt?: Date;

  @Column({
    nullable: false,
    default: UserRoleEnum.NEW_USER,
  })
  role: number = UserRoleEnum.NEW_USER;

  @Column({
    nullable: true,
    name: "two_factor_secret",
  })
  twoFactorSecret?: string;

  @Column({
    nullable: true,
    name: "two_factor_url",
  })
  twoFactorUrl?: string;

  @Column({
    default: false,
    name: "is_authenticated_by_google",
  })
  isAuthenticatedbyGoogle: boolean;

  @Column({
    nullable: true,
    name: "referral_code",
  })
  ReferralCode?: string;

  @Column({
    nullable: true,
    name: "referral_id",
  })
  ReferralId?: string;

  @OneToOne(() => UserProfileEntity)
  @JoinColumn({
    name: "profile_id",
  })
  profile: UserProfileEntity;

  @OneToMany(() => UserDeviceEntity, (ud) => ud.user)
  devices: UserDeviceEntity[];

  @OneToMany(() => UserRefreshTokenEntity, (userref) => userref.user)
  refreshes: UserRefreshTokenEntity[];

  @OneToMany(() => UserAddressEntity, (useraddr) => useraddr.user)
  addresses: UserAddressEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];
}
