import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseError } from 'pg';
import { CommPgErrors } from './constant';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class PostgresErrorFilter implements ExceptionFilter {
  catch(exception: QueryFailedError<DatabaseError>, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    switch (exception.driverError.code) {
      case CommPgErrors.Unique_Violation:
        response.status(409).json({
          statusCode: 409,
          message: 'Conflict: Resource already exists',
        });
        break;
      case CommPgErrors.Numeric_Value_Out_of_Range:
        response.status(422).json({
          statusCode: 422,
          message: 'Unprocessable Entity: Numeric value is out of range',
        });
        break;
      case CommPgErrors.Foreign_Key_Violation:
        response.status(400).json({
          statusCode: 400,
          message: 'Bad Request: Foreign key violation',
        });
        break;
      case CommPgErrors.String_Data_Length_Violation:
        response.status(400).json({
          statusCode: 400,
          message: 'Bad Request: String value exceeds field size',
        });
        break;
      case CommPgErrors.Undefined_Column:
        response.status(400).json({
          statusCode: 400,
          message: 'Bad Request: Undefined column',
        });
        break;
      default:
        response.status(500).json({
          statusCode: 500,
          message: 'Internal Server Error: Something went wrong',
        });
        break;
    }
  }
}
