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
import { isUUID } from 'class-validator';

import { CacheManagerService } from '../cache-manager/cache-manager.service';

import { Role } from '@libs/common/entities';
import { CreateRoleDto, PaginationDto, UpdateRoleDto } from '@libs/common/dtos';

@Injectable()
export class RoleService {
  constructor(
    private cacheManagerService: CacheManagerService,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepository.create(createRoleDto);

      await this.roleRepository.save(role);

      await this.cacheManagerService.clearPatternCache(`roles-list`);
      await this.cacheManagerService.setCache(`role-${role.id}`, role, 86400);

      return role;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const cacheKey = `roles-${limit}-${offset}`;

    const cacheUsers = await this.cacheManagerService.getCache(cacheKey); // TODO: Verify if this is correct

    if (cacheUsers) return cacheUsers;

    const roles = await this.roleRepository.find({
      take: limit,
      skip: offset,
      order: {
        id: 'ASC',
      },
    });

    const totalRoles = await this.roleRepository.count();

    const response = {
      count: totalRoles,
      pages: Math.ceil(totalRoles / limit),
      roles: roles,
    };

    await this.cacheManagerService.setCache(cacheKey, response, 86400);
    await this.cacheManagerService.registerCacheKey(
      'roles-list',
      cacheKey,
      86400,
    );

    return response;
  }

  async findOne(id: string) {
    let role: Role;

    role = await this.cacheManagerService.getCache<Role>(`role-${id}`);

    if (role) return role;

    if (isUUID(id)) {
      role = await this.roleRepository.findOneBy({ id });
    }

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    await this.cacheManagerService.setCache(`role-${id}`, role, 86400);

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    if (!updateRoleDto) throw new BadRequestException('No data to update');

    const role = await this.roleRepository.preload({
      id,
      ...updateRoleDto,
    });

    if (!role) {
      throw new NotFoundException(`Role with id '${id}' not found`);
    }

    try {
      await this.roleRepository.save(role);

      await this.cacheManagerService.clearPatternCache(`roles-list`);
      await this.cacheManagerService.clearPatternCache(`users-list`);
      await this.cacheManagerService.clearPatternCache(`user-id-list`);
      await this.cacheManagerService.setCache(`role-${id}`, role, 86400);

      return role;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { users: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    if (role.users && role.users.length > 0) {
      throw new ConflictException(`Role with id '${id}' is assigned to users`);
    }

    await this.roleRepository.remove(role);

    await this.cacheManagerService.clearPatternCache(`roles-list`);
    await this.cacheManagerService.clearPatternCache(`users-list`);
    await this.cacheManagerService.delCache(`role-${id}`);

    return {
      message: `Role with id '${id}' deleted`,
    };
  }

  private handleError(error: any) {
    if (error.code === '23505') {
      throw new ConflictException('Role already exists');
    } else {
      Logger.error(error);
      throw new InternalServerErrorException(
        'Something went wrong, please check the server logs.',
      );
    }
  }
}
