import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.session || !request.user) {
      return false;
    }

    return true;
  }
}
