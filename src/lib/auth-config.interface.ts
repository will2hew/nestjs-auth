import { BaseUser } from "./base-user";

export interface AuthConfig {
  cookie: {
    /** The name of the authentication cookie */
    name: string;

    /** The secret used to sign the authentication cookie */
    secret: string;

    /** Whether the cookie should be secure (HTTPS only) */
    secure: boolean;
  };

  /** Maximum age of the session in seconds */
  sessionMaximumAge: number;

  /** The user entity class. This should extend `BaseUser` */
  userEntity: typeof BaseUser;
}
