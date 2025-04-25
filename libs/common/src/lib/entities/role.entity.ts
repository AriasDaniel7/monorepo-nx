
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    name: 'name',
    unique: true,
  })
  name!: string;

  @Column({
    type: 'text',
    name: 'description',
    default: null,
    nullable: true,
  })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];
}
