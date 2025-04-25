import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, PaginationDto, UpdateRoleDto } from '@libs/common/dtos';

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('role')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('roles')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.roleService.findAll(paginationDto);
  }

  @Get('role/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Patch('role/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete('role/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.remove(id);
  }
}
