import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { BaseUser } from "./base-user";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): BaseUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
