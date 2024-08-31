import { createHmac } from "node:crypto";
import { AuthConfig } from "../lib/auth-config.interface";
import { AUTH_CONFIG_TOKEN } from "../lib/auth.constants";
import { AuthMiddleware } from "../lib/auth.middleware";
import {
  createSessionCookie,
  initializeTestEnvironment,
  userFields,
} from "./test-utils";
import { SessionStore } from "../lib/session.store";
import { DataSource } from "typeorm";
import { Session } from "../lib/session.entity";
import { BaseUser } from "../lib/base-user";

describe(AuthMiddleware.name, () => {
  let authMiddleware: AuthMiddleware;
  let authConfig: AuthConfig;
  let sessionStore: SessionStore;
  let dataSource: DataSource;

  let user: BaseUser;
  let session: Session;

  const request: {
    session: Session | undefined;
    user: BaseUser | undefined;
    headers: {
      cookie: string | undefined;
    };
  } = {
    session: undefined,
    user: undefined,
    headers: {
      cookie: undefined,
    },
  };

  beforeAll(async () => {
    const moduleRef = await initializeTestEnvironment();

    authConfig = moduleRef.get(AUTH_CONFIG_TOKEN);
    sessionStore = moduleRef.get(SessionStore);
    dataSource = moduleRef.get(DataSource);

    authMiddleware = new AuthMiddleware(authConfig, sessionStore, dataSource);

    user = await dataSource
      .getRepository(authConfig.userEntity)
      .save({ ...userFields });

    session = await sessionStore.createSession(user);

    const hmac = createHmac("sha256", authConfig.cookie.secret);

    hmac.update(session.id);

    request.headers.cookie = `${authConfig.cookie.name}=${createSessionCookie(
      session.id,
      authConfig.cookie.secret
    )}`;
  });

  afterEach(() => {
    request.session = undefined;
    request.user = undefined;
  });

  describe("use", () => {
    it("extract the session if valid", async () => {
      const next = jest.fn();

      await authMiddleware.use(request, {}, next);

      expect(next).toHaveBeenCalledTimes(1);

      const { password, ...expectedUser } = user;

      expect(request["session"]).toEqual(session);
      expect(request["user"]).toEqual(expectedUser);
    });

    it("doesn't extract the session if invalid", async () => {
      const next = jest.fn();

      request.headers.cookie = `${authConfig.cookie.name}=invalid`;

      await authMiddleware.use(request, {}, next);

      expect(next).toHaveBeenCalledTimes(1);

      expect(request["session"]).toBeUndefined();
      expect(request["user"]).toBeUndefined();
    });
  });
});
