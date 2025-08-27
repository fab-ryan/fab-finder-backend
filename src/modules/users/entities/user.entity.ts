import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole } from '@/modules/rbac/entities/user-role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Index(['email'])
@Index(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  bannedAt: Date;

  @Column({ nullable: true, type: 'text' })
  bannedReason: string;

  @Column({ nullable: true })
  bannedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user, {
    cascade: true,
  })
  userRoles: UserRole[];

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isBanned(): boolean {
    return this.status === UserStatus.BANNED;
  }

  get isDisabled(): boolean {
    return (
      this.status === UserStatus.INACTIVE ||
      this.status === UserStatus.SUSPENDED
    );
  }
}
