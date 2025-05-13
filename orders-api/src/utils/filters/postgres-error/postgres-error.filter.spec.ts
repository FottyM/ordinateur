import { PostgresErrorFilter } from './postgres-error.filter';
import { ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { CommPgErrors } from './constant';
import { DatabaseError } from 'pg';
import { mock } from 'vitest-mock-extended';

describe('PostgresErrorFilterFilter', () => {
  let filter: PostgresErrorFilter;
  let mockHost: ArgumentsHost;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    filter = new PostgresErrorFilter();
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ArgumentsHost;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(new PostgresErrorFilter()).toBeDefined();
  });

  it('should catch Unique_Violation error', () => {
    const exception = new QueryFailedError<DatabaseError>(
      'query',
      [],
      mock<DatabaseError>({
        code: CommPgErrors.UniquenessViolation,
      }),
    );
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'Conflict: Resource already exists',
    });
  });

  it('should catch Numeric_Value_Out_of_Range error', () => {
    const exception = new QueryFailedError(
      'query',
      [],
      mock<DatabaseError>({
        code: CommPgErrors.NumericValueOutOfRange,
      }),
    );
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 422,
      message: 'Unprocessable Entity: Numeric value is out of range',
    });
  });

  it('should catch Foreign_Key_Violation error', () => {
    const exception = new QueryFailedError(
      'query',
      [],
      mock<DatabaseError>({
        code: CommPgErrors.ForeignKeyViolation,
      }),
    );
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Bad Request: Foreign key violation',
    });
  });

  it('should catch String_Data_Length_Violation error', () => {
    const exception = new QueryFailedError(
      'query',
      [],
      mock<DatabaseError>({
        code: CommPgErrors.StringDataLengthViolation,
      }),
    );
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Bad Request: String value exceeds field size',
    });
  });

  it('should catch Undefined_Column error', () => {
    const exception = new QueryFailedError(
      'query',
      [],
      mock<DatabaseError>({
        code: CommPgErrors.UndefinedColumn,
      }),
    );
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Bad Request: Undefined column',
    });
  });

  it('should catch default error', () => {
    const exception = new QueryFailedError(
      'query',
      [],
      mock<DatabaseError>({
        code: 'Other_Error',
      }),
    );
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal Server Error: Something went wrong',
    });
  });
});
