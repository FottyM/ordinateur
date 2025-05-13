import validateConfig from '@/utils/validate-configs';
import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Params } from 'nestjs-pino';
import PinoPretty from 'pino-pretty';
import { v4 as uuid } from 'uuid';

class LoggerValidator {
  @IsOptional()
  @IsString()
  LOGGER_RENAME_CONTEXT: string;

  @IsOptional()
  @IsBoolean()
  LOGGER_SINGLE_LINE: boolean;

  @ValidateIf(
    (envValues: Record<string, unknown>) => !!envValues.LOGGER_RENAME_CONTEXT,
  )
  @IsOptional()
  @IsISO8601()
  LOGGER_TRANSLATE_TIME: string;

  @ValidateIf((envValues: Record<string, unknown>) => !!envValues.LOGGER_IGNORE)
  @IsOptional()
  @IsString()
  @Matches(/^([\w.]+(,[\w.]+)*)?$/, {
    message:
      'LOGGER_IGNORE must be a comma-separated string with no whitespace.',
  })
  LOGGER_IGNORE: string;
}

export default registerAs<Params>('logger', (): Params => {
  validateConfig(process.env, LoggerValidator);

  return {
    renameContext: process.env.LOGGER_RENAME_CONTEXT,
    pinoHttp: {
      redact: {
        paths: ['[*][*].password'],
        remove: true,
      },
      transport: {
        target: 'pino-pretty',
        options: {
          singleLine: process.env.LOGGER_SINGLE_LINE === 'true',
          colorize: true,
          colorizeObjects: true,
          translateTime: process.env.LOGGER_TRANSLATE_TIME,
          ignore: process.env.LOGGER_IGNORE,
          customColors: 'debug:white,error:red,info:blue,warn:yellow,fatal:red',
        } satisfies PinoPretty.PrettyOptions,
      },
      customLogLevel(_, res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        } else if (res.statusCode >= 500 || err) {
          return 'error';
        }
        return 'info';
      },
      customReceivedMessage(req, res) {
        return `${res.statusCode} -- ${req.method} ${req.url}`;
      },
      serializers: {
        req(req) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          req.body = req.raw.body;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return req;
        },
      },
      genReqId: () => {
        return uuid();
      },
    },
  };
});
