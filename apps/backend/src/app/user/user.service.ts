import {
  BadRequestException,
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
import { CacheService } from '@common/cache/cache.service';
import { UserResponse } from '@common/interfaces/user-response.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private cacheService: CacheService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      await this.cacheService.setCache(`user-${user.id}`, user);
      await this.cacheService.delCache(`users`);

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

    const key = 'users';

    const cacheUsers = await this.cacheService.getCache<UserResponse>(`users`);

    if (cacheUsers) return cacheUsers;

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      order: {
        id: 'ASC',
      },
    });

    const totalUsers = await this.userRepository.count();

    const response = {
      count: totalUsers,
      pages: Math.ceil(totalUsers / limit),
      users: users,
    };

    await this.cacheService.setCache(`users`, response);

    return response;
  }

  async findOne(id: string) {
    let user: User;

    user = await this.cacheService.getCache<User>(`user-${id}`);

    if (user) return user;

    if (isUUID(id)) {
      user = await this.userRepository.findOneBy({ id });
    }

    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }

    await this.cacheService.setCache(`user-${id}`, user);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!updateUserDto) throw new BadRequestException(`Update data is empty`);

    const { password, ...userData } = updateUserDto;

    const user = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    try {
      await this.userRepository.save(user);

      await this.cacheService.setCache(`user-${user.id}`, user);
      await this.cacheService.delCache(`users`);

      delete user.password;

      return user;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const user = (await this.findOne(id)) as User;

    await this.userRepository.remove(user);
    await this.cacheService.delCache(`users`);
    await this.cacheService.delCache(`user-${id}`);

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
