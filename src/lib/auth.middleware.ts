import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { AUTH_CONFIG_TOKEN } from "./auth.constants";
import { AuthConfig } from "./auth-config.interface";
import { createHmac } from "node:crypto";
import * as cookie from "cookie";
import { SessionStore } from "./session.store";
import type { EntityManager } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(AUTH_CONFIG_TOKEN)
    private readonly config: AuthConfig,
    private readonly sessionStore: SessionStore,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async use(req: any, _res: any, next: () => void): Promise<void> {
    if (!req.headers.cookie) {
      next();
      return;
    }

    const cookies = cookie.parse(req.headers.cookie);

    const signedSessionId: string | undefined =
      cookies[this.config.cookie.name];

    if (!signedSessionId) {
      next();
      return;
    }

    const sessionId = this.verifyCookie(signedSessionId);

    if (!sessionId) {
      next();
      return;
    }

    const session = await this.sessionStore.getSession(sessionId);

    if (session !== null) {
      req["session"] = session;

      req["user"] = await this.entityManager
        .getRepository(this.config.userEntity)
        .findOne({ where: { id: session.userId } });
    }

    next();
  }

  private verifyCookie(signedValue: string): string | undefined {
    const hmac = createHmac("sha256", this.config.cookie.secret);

    const [id, sig] = signedValue.split(".");

    hmac.update(id);

    if (hmac.digest("base64url") === sig) {
      return id;
    }

    return undefined;
  }
}
