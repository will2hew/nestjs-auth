import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
} from "typeorm";
import * as argon2 from "argon2";

export abstract class BaseUser extends BaseEntity {
  abstract id: number | string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: "varchar", nullable: true })
  firstName: string | null;

  @Column({ type: "varchar", nullable: true })
  lastName: string | null;

  @Column({ type: "simple-array" })
  roles: string[];

  @Column({ type: "datetime", nullable: true })
  emailVerifiedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  async verifyEmail(): Promise<this> {
    this.emailVerifiedAt = new Date();
    return this.save();
  }

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword() {
    // Only hash the password if it has been set
    if (this.password) {
      this.password = await argon2.hash(this.password);
    }
  }
}
