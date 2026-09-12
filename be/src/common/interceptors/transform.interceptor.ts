import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<StandardResponse<T> | T> {
    return next.handle().pipe(
      map((result: T) => {
        if (result === undefined || result === null) {
          return {
            success: true,
            data: result,
          } as StandardResponse<T>;
        }

        if (typeof result === "object" && result !== null) {
          if ("success" in result) {
            return result;
          }

          const record = result as Record<string, unknown>;
          if ("data" in record && "meta" in record) {
            return {
              success: true,
              data: record.data as T,
              meta: record.meta as StandardResponse<T>["meta"],
            };
          }
        }

        return {
          success: true,
          data: result,
        };
      })
    );
  }
}
