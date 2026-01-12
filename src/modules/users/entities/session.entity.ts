import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthProvider } from '@/enums';

import { User } from './user.entity';

@Entity('sessions')
@Index(['refreshToken'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ default: AuthProvider.LOCAL, type: 'enum', enum: AuthProvider })
  provider: AuthProvider;

  @OneToOne(() => User, (user) => user.sessions)
  user: User;

  @Column()
  refreshToken: string;

  @Column()
  userAgent: string;

  @Column()
  ipAddress: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
