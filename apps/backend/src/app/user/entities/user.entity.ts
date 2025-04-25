import { Role } from '@role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    name: 'first_name',
  })
  firstName: string;

  @Column({
    type: 'text',
    name: 'last_name',
  })
  lastName: string;

  @Column({
    type: 'text',
    name: 'email',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    name: 'password',
    select: false,
  })
  password: string;

  //   @Column({
  //     type: 'text',
  //     name: 'tax_id',
  //   })
  //   taxId: string;

  @Column({
    type: 'integer',
    name: 'age',
  })
  age: number;

  @Column({
    type: 'text',
    name: 'blood_type',
  })
  bloodType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}
