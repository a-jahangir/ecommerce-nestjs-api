import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsString, IsOptional, IsNotEmpty, IsNumber, IsBoolean } from "class-validator";
import { ConditionEnum } from "../enum/condition.enum";
import { StorageEnum } from "../enum/storage.enum";

export class UpdateVariantDto {
  @ApiProperty({ enum: StorageEnum, example: StorageEnum.GB_256 })
  @IsEnum(StorageEnum)
  storage?: StorageEnum;

  @ApiProperty({ enum: ConditionEnum, example: ConditionEnum.GOOD })
  @IsEnum(ConditionEnum)
  condition?: ConditionEnum;

  @ApiPropertyOptional({ example: "images/iphone-15-pro-max.png" })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiPropertyOptional({ example: "Red" })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: "iPhone 15 Pro Max Image" })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiProperty({ example: "IP15PM-256-GD" })
  @IsString()
  @IsNotEmpty()
  SKU?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  hasChargingCable?: boolean = false;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  hasAdapter?: boolean = false;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  hasAirPod?: boolean = false;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  hasSIMTray?: boolean = false;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  primary?: boolean = false;

  @ApiProperty({ example: 1099.99 })
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional({ example: 1199.99 })
  @IsNumber()
  @IsOptional()
  brandNewPrice?: number;

  @ApiPropertyOptional({ example: 10.5 })
  @IsNumber()
  @IsOptional()
  discount?: number;
}
