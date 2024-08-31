import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { AuthConfigOptions } from "./auth-config.interface";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AUTH_CONFIG_TOKEN } from "./auth.constants";
import { Session } from "./session.entity";
import { AuthMiddleware } from "./auth.middleware";
import { AuthController } from "./auth.controller";
import { SessionStore } from "./session.store";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";

@Module({})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude("auth/sign-in").forRoutes("*");
  }

  static register(options: AuthConfigOptions): DynamicModule {
    return {
      module: AuthModule,
      controllers: [AuthController],
      imports: [TypeOrmModule.forFeature([Session])],
      providers: [
        {
          provide: AUTH_CONFIG_TOKEN,
          useValue: { ...options, userEntity: options.userEntity || User },
        },
        SessionStore,
        AuthService,
      ],
    };
  }
}
