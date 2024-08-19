import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Error, mongoServerErrors } from 'src/common/enums/error.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: any, host: ArgumentsHost): void {
        this.logger.warn(`error name: ${exception.name}`)
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;
        let responseDetails

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.BAD_REQUEST;

        let responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            error: undefined,
            message: undefined,
            stack: undefined
        };



        if (exception.name === Error.MONGO_SERVER_ERROR) {
            switch (exception.code) {
                case mongoServerErrors.DUPLICATE_ENTITY.code:
                    responseDetails = {
                        error: mongoServerErrors.DUPLICATE_ENTITY.error,
                        message: [mongoServerErrors.DUPLICATE_ENTITY.message]
                    }
                    break;

                default:
                    responseDetails = {
                        error: mongoServerErrors.DEFAULT.error,
                        message: [mongoServerErrors.DEFAULT.message]
                    }
                    break;

            }
        }
        else {
            responseDetails = exception instanceof HttpException ? exception.getResponse() : {}
        }

        if (typeof responseDetails === "object" && responseDetails.error) {
            responseBody = { ...responseBody, ...responseDetails }
        }
        else {
            responseBody = {
                ...responseBody,
                error: exception?.name,
                message: exception?.message,
                stack: exception?.stack
            }
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}