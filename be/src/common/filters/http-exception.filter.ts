import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { Prisma } from "@prisma/client";
import { ERROR_CODES } from "../constants/error-codes.constant.js";

interface ErrorResponseBody {
  code?: string;
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const body = exceptionResponse as ErrorResponseBody;
        if (body.code) {
          code = body.code;
        } else if (status === HttpStatus.BAD_REQUEST) {
          code = ERROR_CODES.VALIDATION_ERROR;
        }

        if (Array.isArray(body.message)) {
          message = body.message.join("; ");
        } else if (typeof body.message === "string") {
          message = body.message;
        } else if (body.error) {
          message = body.error;
        }
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        status = HttpStatus.CONFLICT;
        code = "UNIQUE_CONSTRAINT_VIOLATION";
        message = "Unique constraint violation occurred";
      } else if (exception.code === "P2025") {
        status = HttpStatus.NOT_FOUND;
        code = "RECORD_NOT_FOUND";
        message = "The requested record was not found";
      } else {
        status = HttpStatus.BAD_REQUEST;
        code = "DATABASE_ERROR";
        message = "Database operation failed";
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }
}
