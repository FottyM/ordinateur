import {
  IsIn,
  IsInt,
  // IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { COUNTRY_CODES } from '../utils/codes';
import { Transform, Type } from 'class-transformer';

export class GetOrdersQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  paymentDescription: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.toUpperCase())
  @IsIn(COUNTRY_CODES, { message: 'Invalid ISO 3166 country code' })
  country: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}
