import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { isUUID } from 'class-validator';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PostgresError } from '@common/interfaces/postgres-error.interface';
import { PaginationDto } from '@common/dtos/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        user,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      order: {
        id: 'ASC',
      },
    });

    const totalUsers = await this.userRepository.count();

    return {
      count: totalUsers,
      pages: Math.ceil(totalUsers / limit),
      users: users,
    };
  }

  async findOne(id: string) {
    let user: User;

    if (isUUID(id)) {
      user = await this.userRepository.findOneBy({ id });
    }

    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return {
      message: `User with id '${id}' deleted`,
    };
  }

  private handleError(error: any) {
    if (error.code === '23505') {
      const err = error as PostgresError;

      const field = this.extractFieldFromDetail(err.detail);
      throw new ConflictException(
        `There is already a user with this ${field} address.`,
      );
    }

    Logger.error(error);

    throw new InternalServerErrorException(
      'Something went wrong, please check the server logs.',
    );
  }

  private extractFieldFromDetail(detail: string): string {
    const matches = detail.match(/Key \(([^)]+)\)=/);
    return matches ? matches[1] : 'valor';
  }
}
