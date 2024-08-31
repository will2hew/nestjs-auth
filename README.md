<h1 align="center">
nestjs-auth
</h1>

<p align="center">
Simple authentication system for NestJS using TypeORM.
</p>

<p align="center">
<img alt="NPM Version" src="https://img.shields.io/npm/v/@will2hew/nestjs-auth">
<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@will2hew-nestjs-auth">
<img alt="NPM License" src="https://img.shields.io/npm/l/@will2hew/nestjs-auth">
</p>

## Installation

```bash
$ npm i --save @will2hew/nestjs-auth
```

## Usage

Import the `User` and `Session` entities, and register the `AuthModule`

```typescript
import { AuthModule, User, Session } from "@will2hew/nestjs-auth";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // connection options
      entities: [User, Session],
    }),
    AuthModule.register({
      prefix: "/auth",
      cookie: {
        name: "sid",
        secret: "super-secret",
        secure: false, // set to true in production
      },
      sessionMaximumAge: 60 * 60 * 24, // 24 hours
    }),
  ],
})
export class AppModule {}
```

Create a new user

```typescript
const user = new User();

user.email = "john@nestjs.com";
user.password = "password";

user.firstName = "John";
user.lastName = "Smith";

await this.userRepository.save(user);
```

Sign in as the user

```http
POST /auth/sign-in
Content-Type: application/json

{
    "email": "john@nestjs.com",
    "password": "password"
}
```

## Protecting endpoints

`nestjs-auth` provides a guard to protect backend routes.

```typescript
import { AuthGuard } from "@will2hew/nestjs-auth";

@Controller()
@UseGuards(AuthGuard)
export class AppController {
  @Get()
  getData() {
    return "Hello, World!";
  }
}
```

You can also require the user has the correct role

```typescript
import { AuthGuard, Roles } from "@will2hew/nestjs-auth";

@Controller()
@UseGuards(AuthGuard)
export class AppController {
  @Roles("admin")
  @Get("admin")
  getAdminData() {
    return "Top secret!";
  }
}
```

## Accessing the signed in user

You will typically want to access the signed in user to only respond with data relevant to them. `nestjs-auth` provides a decorator for this situation.

```typescript
import { AuthGuard, CurrentUser, User } from "@will2hew/nestjs-auth";

@Controller()
@UseGuards(AuthGuard)
export class AppController {
  @Get("me")
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
```

## Extending the User

The default `nestjs-auth` user offers a set of commonly used user profile fields, but if you'd like to go beyond these you can extend the `BaseUser` class.

```typescript
@Entity()
export class OrganizationUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organizationId: string;
}
```

And provide it during registration

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      // connection options
      entities: [OrganizationUser, Session],
    }),
    AuthModule.register({
      userEntity: OrganizationUser,
      // rest of your configuration
    }),
  ],
})
export class AppModule {}
```

## User API

**Fields**

| Field             | Type                | Required | Description                                                   |
| ----------------- | ------------------- | -------- | ------------------------------------------------------------- |
| `id`              | `string \| number ` | ✅       | The primary identifier for the user.                          |
| `email`           | `string`            | ✅       | The users email.                                              |
| `password`        | `string`            | ✅       | The users password. Automatically hashed when set or updated. |
| `firstName`       | `string`            | ×        | The users first name.                                         |
| `lastName`        | `string`            | ×        | The users last name.                                          |
| `roles`           | `string[]`          | ✅       | A string array of the users role(s).                          |
| `emailVerifiedAt` | `Date`              | ×        | The date and time the users email was marked verified.        |

**Methods**

`verifyEmail()`

Sets `emailVerifiedAt` to the current date and time.

**Example:**

```typescript
await user.verifyEmail();
```
