import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AUTH_CONFIG_TOKEN } from "./auth.constants";
import { AuthConfig } from "./auth-config.interface";
import { EntityManager } from "typeorm";
import { BaseUser } from "./base-user";
import * as argon2 from "argon2";
import { InjectEntityManager } from "@nestjs/typeorm";

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_CONFIG_TOKEN) private readonly config: AuthConfig,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async signIn(email: string, password: string): Promise<BaseUser> {
    const repository = this.entityManager.getRepository(this.config.userEntity);

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
