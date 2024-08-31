import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "varchar" })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  destroyedAt: Date;

  /**  */
  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  lastUsedAt: Date;
}
