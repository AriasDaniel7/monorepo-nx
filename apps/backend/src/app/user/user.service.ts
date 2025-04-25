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
import { Role } from '@role/entities/role.entity';
import { UserMapper } from '@common/mapper/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private cacheService: CacheService,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, roles = ['user'], ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      user.roles = await this.rolesUser(roles);

      await this.userRepository.save(user);

      delete user.password;

      //Cache
      await this.cacheService.clearPatternCache(`users-list`);
      await this.cacheService.clearPatternCache(`roles-list`);
      const cacheKey = `user-${user.id}`;
      await this.cacheService.setCache(
        cacheKey,
        UserMapper.mapperRoleToUser(user),
        86400,
      );
      await this.cacheService.registerCacheKey('user-id-list', cacheKey, 86400);

      return UserMapper.mapperRoleToUser(user);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const cacheKey = `users-${limit}-${offset}`;

    const cacheUsers = await this.cacheService.getCache<UserResponse>(cacheKey);

    if (cacheUsers) return cacheUsers;

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      order: {
        id: 'ASC',
      },
      relations: { roles: true },
    });

    const totalUsers = await this.userRepository.count();

    const response = {
      count: totalUsers,
      pages: Math.ceil(totalUsers / limit),
      users: UserMapper.mapperRoleToUsers(users),
    };

    await this.cacheService.setCache(cacheKey, response, 86400);
    await this.cacheService.registerCacheKey('users-list', cacheKey, 86400);

    return response;
  }

  async findOne(id: string) {
    let user: User;

    user = await this.cacheService.getCache<User>(`user-${id}`);

    if (user) return user;

    if (isUUID(id)) {
      user = await this.userRepository.findOne({
        where: { id },
        relations: { roles: true },
      });
    }

    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }

    const cacheKey = `user-${id}`;
    await this.cacheService.setCache(
      cacheKey,
      UserMapper.mapperRoleToUser(user),
      86400,
    );
    await this.cacheService.registerCacheKey('user-id-list', cacheKey, 86400);

    return UserMapper.mapperRoleToUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!updateUserDto) throw new BadRequestException('Update data is empty');

    const { roles, password, ...userData } = updateUserDto;

    const existingUser = await this.userRepository.findOneBy({ id });

    if (!existingUser) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }

    const user = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    try {
      user.roles = roles ? await this.rolesUser(roles) : existingUser.roles;

      await this.userRepository.save(user);

      delete user.password;

      await this.cacheService.clearPatternCache(`users-list`);
      await this.cacheService.clearPatternCache(`roles-list`);
      const cacheKey = `user-${id}`;
      await this.cacheService.setCache(
        cacheKey,
        UserMapper.mapperRoleToUser(user),
        86400,
      );
      await this.cacheService.registerCacheKey('user-id-list', cacheKey, 86400);

      return UserMapper.mapperRoleToUser(user);
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const user = (await this.findOne(id)) as User;

    await this.userRepository.remove(user);

    await this.cacheService.clearPatternCache(`users-list`);
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

  private async rolesUser(roles: string[]) {
    return await Promise.all(
      roles.map(async (name) => {
        let role: Role;

        role = await this.roleRepository.findOneBy({ name });

        if (!role) {
          role = this.roleRepository.create({ name });
          await this.roleRepository.save(role);
        }
        return role;
      }),
    );
  }
}
