import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

type PublicError = {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const { status, error } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception as Error);
    }

    response.status(status).json({ success: false, error });
  }

  private resolve(exception: unknown): { status: number; error: PublicError } {
    if (exception instanceof BadRequestException) return this.validationError(exception);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return {
        status,
        error: { code: this.codeForStatus(status), message: this.httpMessage(exception) },
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const conflict = exception.code === 'P2002';
      const missing = exception.code === 'P2025';
      const status = conflict ? HttpStatus.CONFLICT : missing ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      return {
        status,
        error: {
          code: this.codeForStatus(status),
          message: conflict ? 'A record with this value already exists' : missing ? 'Record not found' : 'Invalid database operation',
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    };
  }

  private validationError(exception: BadRequestException): { status: number; error: PublicError } {
    const body = exception.getResponse();
    const messages = typeof body === 'object' && body !== null && 'message' in body
      ? (body as { message: string | string[] }).message
      : exception.message;
    const list = Array.isArray(messages) ? messages : [messages];

    return {
      status: HttpStatus.BAD_REQUEST,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: list.map((message) => ({ field: message.split(' ')[0] ?? 'request', message })),
      },
    };
  }

  private httpMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    const message = (body as { message?: string | string[] }).message;
    return Array.isArray(message) ? message[0] ?? exception.message : message ?? exception.message;
  }

  private codeForStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'RATE_LIMITED',
    };
    return codes[status] ?? 'INTERNAL_ERROR';
  }
}
