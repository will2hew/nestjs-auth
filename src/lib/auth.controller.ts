import { Body, Controller, Inject, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SessionStore } from "./session.store";
import * as cookie from "cookie";
import { AUTH_CONFIG_TOKEN } from "./auth.constants";
import { AuthConfig } from "./auth-config.interface";
import { Session } from "./session.entity";
import { createHmac } from "node:crypto";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AUTH_CONFIG_TOKEN) private readonly config: AuthConfig,
    private readonly authService: AuthService,
    private readonly sessionStore: SessionStore
  ) {}

  @Post("sign-in")
  async signIn(
    @Body("email") email: string,
    @Body("password") password: string,
    @Res({ passthrough: true }) res: any
  ): Promise<void> {
    const user = await this.authService.signIn(email, password);
    const session = await this.sessionStore.createSession(user);

    this.setCookie(res, session);
  }

  @Post("sign-out")
  async signOut(
    @Req() req: any,
    @Res({ passthrough: true }) res: any
  ): Promise<void> {
    if (req.session) {
      await this.sessionStore.destroySession(req.session.id);
    }

    this.clearCookie(res);
  }

  private setCookie(res: any, session: Session): void {
    const hmac = createHmac("sha256", this.config.cookie.secret);

    hmac.update(session.id);

    const cookieHeader = cookie.serialize(
      this.config.cookie.name,
      // The session ID is signed with an HMAC to prevent tampering.
      `${session.id}.${hmac.digest("base64url")}`,
      {
        path: "/",
        httpOnly: true,
        expires: session.expiresAt,
        secure: this.config.cookie.secure,
      }
    );

    if ("setHeader" in res) {
      // The `setHeader` method is used in Express.js.
      res.setHeader("Set-Cookie", cookieHeader);
    } else {
      // The `header` method is used in Fastify.
      res.header("Set-Cookie", cookieHeader);
    }
  }

  private clearCookie(res: any): void {
    const cookieHeader = cookie.serialize(this.config.cookie.name, "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      secure: this.config.cookie.secure,
    });

    if ("setHeader" in res) {
      res.setHeader("Set-Cookie", cookieHeader);
    } else {
      res.header("Set-Cookie", cookieHeader);
    }
  }
}
