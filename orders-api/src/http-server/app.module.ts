import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfigs from '@/configs/db.configs';
import appConfigs from '@/configs/app.configs';
import {
  CombinedConfigs,
  DatabaseConfig,
} from '@/configs/configs.types';
import { LoggerModule } from 'nestjs-pino';
import loggerConfigs from '@/configs/logger.configs';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfigs, appConfigs, loggerConfigs],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<CombinedConfigs>) => {
        const dbConfig = configService.getOrThrow<DatabaseConfig>('database');
        return {
          ...dbConfig,
          autoLoadEntities: true,
        };
      },
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<CombinedConfigs>) => {
        return configService.getOrThrow<CombinedConfigs['logger']>('logger');
      },
    }),
  ],
})
export class AppModule {}
