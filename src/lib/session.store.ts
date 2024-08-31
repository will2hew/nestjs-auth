import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "./session.entity";
import { Repository } from "typeorm";
import { BaseUser } from "./base-user";
import { AUTH_CONFIG_TOKEN } from "./auth.constants";
import { AuthConfig } from "./auth-config.interface";

@Injectable()
export class SessionStore {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @Inject(AUTH_CONFIG_TOKEN) private readonly config: AuthConfig
  ) {}

  async getSession(id: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({ where: { id } });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session;
  }

  async createSession(user: BaseUser): Promise<Session> {
    const session = new Session();

    session.userId = String(user.id);
    session.expiresAt = new Date(
      Date.now() + this.config.sessionMaximumAge * 1000
    );

    return this.sessionRepository.save(session);
  }

  async destroySession(id: string): Promise<void> {
    await this.sessionRepository.softDelete(id);
  }
}
