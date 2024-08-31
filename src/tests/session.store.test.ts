import { DataSource } from "typeorm";
import { BaseUser } from "../lib/base-user";
import { SessionStore } from "../lib/session.store";
import { initializeTestEnvironment, User, userFields } from "./test-utils";
import { Session } from "../lib/session.entity";

describe(SessionStore.name, () => {
  let sessionStore: SessionStore;
  let dataSource: DataSource;
  let user: BaseUser;

  beforeAll(async () => {
    const moduleRef = await initializeTestEnvironment();

    sessionStore = moduleRef.get(SessionStore);
    dataSource = moduleRef.get(DataSource);

    const repository = dataSource.getRepository(User);

    user = repository.create({ ...userFields });

    await user.save();
  });

  afterEach(async () => {
    await dataSource.getRepository(Session).clear();
  });

  it("creates a session", async () => {
    const session = await sessionStore.createSession(user);

    expect(session).toBeDefined();
  });

  it("retrieves a session by its ID", async () => {
    const session = await sessionStore.createSession(user);

    const retrievedSession = await sessionStore.getSession(session.id);

    expect(retrievedSession).toEqual(session);
  });

  it("does not retrieve a session that has expired", async () => {
    const session = await sessionStore.createSession(user);

    session.expiresAt = new Date(Date.now() - 1000);

    await session.save();

    const retrievedSession = await sessionStore.getSession(session.id);

    expect(retrievedSession).toBeNull();
  });
});
