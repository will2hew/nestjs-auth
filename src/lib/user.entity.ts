import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseUser } from "./base-user";

@Entity()
export class User extends BaseUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}
