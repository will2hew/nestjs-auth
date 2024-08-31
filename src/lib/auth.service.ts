import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AUTH_CONFIG_TOKEN } from "./auth.constants";
import { AuthConfig } from "./auth-config.interface";
import { DataSource } from "typeorm";
import { BaseUser } from "./base-user";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_CONFIG_TOKEN) private readonly config: AuthConfig,
    private readonly dataSource: DataSource
  ) {}

  async signIn(email: string, password: string): Promise<BaseUser> {
    const repository = this.dataSource.getRepository(this.config.userEntity);

    const user = await repository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const verified = await argon2.verify(user.password, password);

    if (!verified) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return user;
  }
}
