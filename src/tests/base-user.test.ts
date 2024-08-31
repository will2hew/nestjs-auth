import { DataSource, Repository } from "typeorm";
import { BaseUser } from "../lib/base-user";
import { initializeTestEnvironment, userFields } from "./test-utils";
import { User } from "../lib/user.entity";

describe(BaseUser.name, () => {
  let repository: Repository<BaseUser>;

  beforeAll(async () => {
    const moduleRef = await initializeTestEnvironment();

    repository = moduleRef.get(DataSource).getRepository(User);
  });

  afterEach(async () => {
    await repository.clear();
  });

  it("hashes the password when creating a user", async () => {
    const user = repository.create({ ...userFields, roles: ["user"] });

    expect(await user.save()).toEqual({
      ...userFields,

      id: expect.any(String),
      roles: ["user"],
      emailVerifiedAt: null,
      password: expect.stringContaining("$argon2"),
      createdAt: expect.any(Date),
    });
  });

  it("updates the password hash when the password is changed", async () => {
    const user = repository.create({ ...userFields, roles: ["user"] });

    await user.save();

    const originalHash = user.password;

    user.password = "new-password";

    await user.save();

    expect(user.password).not.toEqual(originalHash);
  });
});
