import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsIn,
  ValidateBy,
} from 'class-validator';
import { COUNTRY_CODES, CURRENCY_CODES } from '../utils/codes';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  orderNumber: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  paymentDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  streetAddress: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  town: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.toUpperCase())
  @IsIn(COUNTRY_CODES, { message: 'Invalid ISO 3166 country code' })
  country: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.toUpperCase())
  @IsIn(CURRENCY_CODES, { message: 'Invalid ISO 4217 currency code' })
  currency: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Amount must be at least 1 cent' })
  amount: number;

  @IsNotEmpty()
  @ValidateBy({
    name: 'isFutureDate',
    validator: {
      validate: (value: string) => new Date(value) > new Date(),
      defaultMessage: () => 'Payment due date must be in the future',
    },
  })
  paymentDueDate: string;
}
