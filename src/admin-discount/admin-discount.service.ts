import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminEntity } from "../admin/entity/admin.entity";
import { DiscountCouponEntity } from "../user-discount/entity/discount.entity";
import { ILike, Repository } from "typeorm";
import { getDiscountCouponDto } from "./dto/get-discount.dto";
import { DiscountTypeEnum } from "../user-discount/enum/discountType.enum";
import { CreateAdminDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";

@Injectable()
export class AdminDiscountService {
  constructor(
    @InjectRepository(DiscountCouponEntity)
    private readonly discountCouponRepo: Repository<DiscountCouponEntity>
  ) {}

  private createResponseData<T>(mapper: (...args: any[]) => T, ...args: any[]): T {
    return mapper(...args);
  }

  private isValueInEnum<T>(enumType: T, value: string | number): boolean {
    return Object.values(enumType).includes(value);
  }

  private generateCouponCode(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let coupon = letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 1; i < 8; i++) {
      coupon += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
    }
    return coupon;
  }

  async activateDiscount(admin: AdminEntity, id: number): Promise<getDiscountCouponDto> {
    let discount = await this.discountCouponRepo.findOne({
      where: { id, adminId: admin.id },
    });
    if (!discount || discount.adminId != admin.id) throw new BadRequestException();

    discount.isActive == true ? (discount.isActive = false) : (discount.isActive = true);

    discount = await this.discountCouponRepo.save(discount);
    return this.createResponseData<getDiscountCouponDto>(
      (discount: DiscountCouponEntity, admin: AdminEntity) => ({
        id: discount.id,
        code: discount.code,
        couponType: DiscountTypeEnum[discount.discountType],
        discountAmount: discount.discountAmount,
        discountPercentage: discount.discountPercentage,
        maxDiscount: discount.maxDiscount,
        usageCount: discount.usageCount,
        usageLimit: discount.usageLimit,
        expiredAt: discount.expiredAt,
        isActive: discount.isActive,
        createdAt: discount.createAt,
        updatedAt: discount.updateAt,
        adminInfo: {
          id: admin.id,
          email: admin.email,
          role: null,
        },
      }),
      discount,
      admin
    );
  }

  async getDiscountDetails(id: number, admin: AdminEntity): Promise<getDiscountCouponDto> {
    const discount = await this.discountCouponRepo.findOne({
      where: { id, adminId: admin.id },
    });
    if (!discount) throw new BadRequestException();
    return this.createResponseData<getDiscountCouponDto>(
      (discount: DiscountCouponEntity, admin: AdminEntity) => ({
        id: discount.id,
        code: discount.code,
        couponType: discount.discountType,
        discountAmount: discount.discountAmount,
        discountPercentage: discount.discountPercentage,
        maxDiscount: discount.maxDiscount,
        usageCount: discount.usageCount,
        usageLimit: discount.usageLimit,
        expiredAt: discount.expiredAt,
        isActive: discount.isActive,
        createdAt: discount.createAt,
        updatedAt: discount.updateAt,
        adminInfo: {
          id: admin.id,
          email: admin.email,
          role: null,
        },
      }),
      discount,
      admin
    );
  }

  async getDiscountByCoupon(couponCode: string): Promise<getDiscountCouponDto> {
    const coupon = await this.discountCouponRepo.findOne({
      where: { code: couponCode },
    });
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException("Invalid coupon code");
    }
    return {
      id: coupon.id,
      code: coupon.code,
      couponType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      discountPercentage: coupon.discountPercentage,
      maxDiscount: coupon.maxDiscount,
      usageCount: coupon.usageCount,
      usageLimit: coupon.usageLimit,
      expiredAt: coupon.expiredAt,
      isActive: coupon.isActive,
      createdAt: coupon.createAt,
      updatedAt: coupon.updateAt,
    };
  }

  async getDiscountList(take: number, skip: number, searchkey?: string) {
    const [resList, totalItems] = await this.discountCouponRepo.findAndCount({
      take,
      skip,
      where: searchkey ? [{ code: ILike(`%${searchkey}%`) }] : undefined,
      order: {
        createAt: "desc",
      },
    });
    const discountCouponOverviewList = resList.map(
      ({
        id,
        code,
        discountType,
        usageCount,
        usageLimit,
        isActive,
        expiredAt,
        createAt,
        discountAmount,
        discountPercentage,
      }) => ({
        id,
        code,
        usageCount,
        usageLimit,
        isActive,
        expiredAt,
        createAt,
        discountType,
        discountAmount,
        discountPercentage,
      })
    );
    return { discountCouponOverviewList, totalItems };
  }

  async createDiscountCoupon(admin: AdminEntity, data: CreateAdminDiscountDto): Promise<getDiscountCouponDto> {
    if (!data.expiredAt) {
      throw new BadRequestException();
    }
    let newDiscount = new DiscountCouponEntity();
    newDiscount.adminId = admin.id;
    newDiscount.expiredAt = data.expiredAt;
    newDiscount.usageLimit = data.usageLimit ?? 0;
    newDiscount.usageCount = 0;
    newDiscount.isActive = false;
    newDiscount.code = this.generateCouponCode();
    while (true) {
      const existCode = await this.discountCouponRepo.findOne({
        where: { code: newDiscount.code },
      });
      if (existCode != null) newDiscount.code = this.generateCouponCode();
      else break;
    }
    if (data.couponType === DiscountTypeEnum.FIXED) {
      if (data.discountAmount == null) {
        throw new BadRequestException();
      }
      newDiscount.discountAmount = data.discountAmount;
    } else if (data.couponType === DiscountTypeEnum.PERCENTAGE) {
      if (data.discountPercentage == null) {
        throw new BadRequestException();
      }
      newDiscount.discountPercentage = data.discountPercentage;
      newDiscount.maxDiscount = data.maxDiscount ?? null;
    } else {
      throw new BadRequestException();
    }
    newDiscount.discountType = data.couponType;
    newDiscount = await this.discountCouponRepo.save(newDiscount);
    return this.createResponseData<getDiscountCouponDto>(
      (discount: DiscountCouponEntity, admin: AdminEntity) => ({
        id: discount.id,
        code: discount.code,
        couponType: DiscountTypeEnum[discount.discountType],
        discountAmount: discount.discountAmount,
        discountPercentage: discount.discountPercentage,
        maxDiscount: discount.maxDiscount,
        usageCount: discount.usageCount,
        usageLimit: discount.usageLimit,
        expiredAt: discount.expiredAt,
        isActive: discount.isActive,
        createdAt: discount.createAt,
        updatedAt: discount.updateAt,
        adminInfo: {
          id: admin.id,
          email: admin.email,
          role: null,
        },
      }),
      newDiscount,
      admin
    );
  }

  async updateDiscountDto(id: number, data: UpdateDiscountDto, admin: AdminEntity): Promise<getDiscountCouponDto> {
    let discount = await this.discountCouponRepo.findOne({ where: { id } });
    if (!discount) throw new NotFoundException();
    if (discount.adminId != admin.id) throw new BadRequestException();
    const { expiredAt, usageLimit } = data;
    if (discount.usageCount >= usageLimit) throw new BadRequestException();
    else discount.usageLimit = usageLimit;
    if (new Date().getTime() >= new Date(expiredAt).getTime()) throw new BadRequestException();
    else discount.expiredAt = expiredAt;
    discount = await this.discountCouponRepo.save(discount);
    return this.createResponseData<getDiscountCouponDto>(
      (discount: DiscountCouponEntity, admin: AdminEntity) => ({
        id: discount.id,
        code: discount.code,
        couponType: DiscountTypeEnum[discount.discountType],
        discountAmount: discount.discountAmount,
        discountPercentage: discount.discountPercentage,
        maxDiscount: discount.maxDiscount,
        usageCount: discount.usageCount,
        usageLimit: discount.usageLimit,
        expiredAt: discount.expiredAt,
        isActive: discount.isActive,
        createdAt: discount.createAt,
        updatedAt: discount.updateAt,
        adminInfo: {
          id: admin.id,
          email: admin.email,
          role: null,
        },
      }),
      discount,
      admin
    );
  }
}
