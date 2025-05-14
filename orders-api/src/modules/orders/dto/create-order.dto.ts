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
    name: 'isFutureOrTodayDateUTC',
    validator: {
      validate: (value: string) => {
        const now = new Date();
        const input = new Date(value);
        // Compare only the UTC date part
        const nowUTC = Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
        );
        const inputUTC = Date.UTC(
          input.getUTCFullYear(),
          input.getUTCMonth(),
          input.getUTCDate(),
        );
        return inputUTC >= nowUTC;
      },
      defaultMessage: () =>
        'Payment due date must be today or in the future (UTC)',
    },
  })
  paymentDueDate: string;
}
