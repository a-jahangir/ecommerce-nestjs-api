import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { AdminUserDto } from "./dto/admin.user.dto";
import { GenderEnum } from "../shared/enum/gender.enum";
import { UserEntity } from "../user/entity/user.entity";
import { BaseInfoService } from "../baseinfo/baseinfo.service";
import { CountryEntity } from "../baseinfo/entity/country.entity";
import { AdminUserprofileDto } from "./dto/admin.user.profile.dto";
import { UserProfileEntity } from "../user/entity/user.profile.entity";
import { UserLoginHistoryEntity } from "../user/entity/user.login.history.entity";

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepo: Repository<UserProfileEntity>,
    @InjectRepository(UserLoginHistoryEntity)
    private readonly userLoginHistoryRepo: Repository<UserLoginHistoryEntity>,
    private readonly baseInfoService: BaseInfoService
  ) {}

  private createResponseData<T>(mapper: (...args: any[]) => T, ...args: any[]): T {
    return mapper(...args);
  }

  async getUserProfile(userId: string): Promise<AdminUserprofileDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ["profile"],
    });
    if (!user) throw new NotFoundException("USER.NOT_FOUND");
    return this.createResponseData<AdminUserprofileDto>(
      (user: UserEntity) => ({
        id: user.id,
        firstname: user.firstName,
        lastname: user.lastName,
        gender: GenderEnum[user.profile.gender],
        email: user.email,
        cellPhone: user.profile.phone,
        address: user.profile.address,
        postalCode: user.profile.postalCode,
        avatarImgPath: user.profile.avatarImgPath,
        twoFactorActivatedAt: user.twoFactorActivatedAt,
        createAt: user.createAt,
        updateAt: user.updateAt,
      }),
      user
    );
  }

  async getUserAdminList(
    take: number,
    skip: number,
    searchkey?: string
  ): Promise<{ userList: UserEntity[]; totalItems: number }> {
    const [userList, totalItems] = await this.userRepo.findAndCount({
      take,
      skip,
      where: searchkey
        ? [
            { firstName: ILike(`%${searchkey}%`) },
            { lastName: ILike(`%${searchkey}%`) },
            { email: ILike(`%${searchkey}`) },
          ]
        : undefined,
      relations: ["profile"],
      order: {
        createAt: "desc",
      },
    });
    return { userList: userList, totalItems: totalItems };
  }

  async switchBlockStatusUserById(id: string): Promise<AdminUserDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BadRequestException("USER.INVALID");
    if (user.blockedAt == null) user.blockedAt = new Date();
    else user.blockedAt = null;
    await this.userRepo.save(user);
    return this.createResponseData<AdminUserDto>(
      (user: UserEntity) => ({
        id: user.id,
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        blockedAt: user.blockedAt,
        createAt: user.createAt,
        registeredAt: user.registeredAt,
      }),
      user
    );
  }
}
