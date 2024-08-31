import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Session } from "./session.entity";
import { BaseUser } from "./base-user";

interface AuthenticatedRequest {
  session: Session;
  user: BaseUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.session || !request.user) {
      return false;
    }

    const roles = this.reflector.get<string[]>("roles", context.getHandler());

    if (!roles) {
      return true;
    }

    return request.user.roles.some((role) => roles.includes(role));
  }
}
