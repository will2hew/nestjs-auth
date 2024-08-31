import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../lib/auth.module";
import { Session } from "../lib/session.entity";
import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseUser } from "../lib/base-user";
import { createHmac } from "node:crypto";

@Entity()
export class User extends BaseUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}

export async function initializeTestEnvironment(): Promise<TestingModule> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: "sqlite",
        database: ":memory:",
        entities: [User, Session],
        synchronize: true,
      }),
      AuthModule.register({
        cookie: { name: "sid", secret: "secret", secure: false },
        sessionMaximumAge: 60 * 60 * 24,
        userEntity: User,
      }),
    ],
  }).compile();

  return moduleRef;
}

export function createSessionCookie(sessionId: string, secret: string): string {
  const hmac = createHmac("sha256", secret);

  hmac.update(sessionId);

  return `${sessionId}.${hmac.digest("base64url")}`;
}

export const userFields = {
  email: "test@testing.com",
  password: "password",
  firstName: "Test",
  lastName: "User",
  roles: ["user"],
};
