import { AuthController } from "../lib/auth.controller";
import { SessionStore } from "../lib/session.store";
import { initializeTestEnvironment } from "./test-utils";
import { DataSource } from "typeorm";
import { AuthConfig } from "../lib/auth-config.interface";
import { AUTH_CONFIG_TOKEN } from "../lib/auth.constants";

describe(AuthController.name, () => {
  let authController: AuthController;
  let authConfig: AuthConfig;
  let sessionStore: SessionStore;

  beforeAll(async () => {
    const moduleRef = await initializeTestEnvironment();

    authController = moduleRef.get(AuthController);
    sessionStore = moduleRef.get(SessionStore);

    authConfig = moduleRef.get(AUTH_CONFIG_TOKEN);

    const repository = moduleRef
      .get(DataSource)
      .getRepository(authConfig.userEntity);

    const user = repository.create();

    user.email = "test@testing.com";
    user.password = "password";
    user.firstName = "Test";
    user.lastName = "User";
    user.roles = ["user"];

    await repository.save(user);
  });

  describe("sign-in", () => {
    let mockResponse: {
      setHeader: jest.Mock;
    };

    beforeEach(() => {
      // Reset the mock response before each test
      mockResponse = {
        setHeader: jest.fn(),
      };
    });

    it("creates a session when the correct email and password is used", async () => {
      await authController.signIn("test@testing.com", "password", mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("sid=")
      );

      const cookieHeader = mockResponse.setHeader.mock.calls[0][1] as string;
      const sessionId = cookieHeader.split(";")[0].split("=")[1].split(".")[0];

      expect(await sessionStore.getSession(sessionId)).not.toBeNull();
    });

    it("throws an error when the email is incorrect", async () => {
      await expect(
        authController.signIn("wrong@testing.com", "password", mockResponse)
      ).rejects.toThrow("Invalid email or password");

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it("throws an error when the password is incorrect", async () => {
      await expect(
        authController.signIn("test@testing.com", "wrong", mockResponse)
      ).rejects.toThrow("Invalid email or password");

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });
  });

  describe("sign-out", () => {
    let mockResponse: { setHeader: jest.Mock };

    beforeEach(() => {
      mockResponse = { setHeader: jest.fn() };
    });

    it("destroys the session and clears the cookie", async () => {
      await authController.signIn("test@testing.com", "password", mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("sid=")
      );

      const cookieHeader = mockResponse.setHeader.mock.calls[0][1] as string;
      const sessionId = cookieHeader.split(";")[0].split("=")[1].split(".")[0];

      const session = await sessionStore.getSession(sessionId);

      expect(session).not.toBeNull();

      await authController.signOut({ session: session }, mockResponse);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(sessionStore.getSession(session!.id)).resolves.toBeNull();
    });
  });
});
