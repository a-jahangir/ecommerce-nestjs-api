import { CountryEntity } from "../../baseinfo/entity/country.entity";

export class UserAddressDetailsDto {
  firstName: string;
  lastName: string;
  postalcode: string;
  country: CountryEntity;
  city: string;
  streetAddress: string;
  houseNumber: string;
  description: string;
}
