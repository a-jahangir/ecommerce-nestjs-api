import { CountryEntity } from "../../baseinfo/entity/country.entity";

export class UserProfileDto {
  id: string;
  gender: string;
  country: CountryEntity;
  address: string;
  postalCode: string;
  avatarImgPath: string;
  createAt: Date;
  updateAt: Date;
}
