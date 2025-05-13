import { registerAs } from '@nestjs/config';
import { AppConfig } from './configs.types';
import validateConfig from '@/utils/validate-configs';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

class AppEnvVarsValidator {
  @ValidateIf((envValues: Record<string, unknown>) => !!envValues.APP_PORT)
  @IsInt()
  @IsPositive()
  APP_PORT: number;

  @ValidateIf((envValues: Record<string, unknown>) => !!envValues.NODE_ENV)
  @IsString()
  @IsNotEmpty()
  NODE_ENV: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, AppEnvVarsValidator);

  return {
    appPort: parseInt(process.env.APP_PORT ?? '3000', 10),
    isProduction: process.env.NODE_ENV === 'production',
  };
});
