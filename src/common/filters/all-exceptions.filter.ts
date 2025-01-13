import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      `Exception occurred: ${
        exception instanceof Error ? exception.message : 'Unknown error'
      }`,
      {
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        stack: exception instanceof Error ? exception.stack : undefined,
        body: request.body,
      },
    );

    const responseBody = {
      statusCode: httpStatus,
      message: this.getClientMessage(httpStatus),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getClientMessage(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Invalid request parameters';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable';
      default:
        return 'Something went wrong';
    }
  }
}
