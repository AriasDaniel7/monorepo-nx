import { Role } from '@role/entities/role.entity';
import { User } from '@user/entities/user.entity';

export class UserMapper {
  static mapperRoleToUsers(users: User[]) {
    return users.map((user) => ({
      ...user,
      roles: this.simplyfyRoles(user.roles),
    }));
  }

  static mapperRoleToUser(user: User) {
    return {
      ...user,
      roles: this.simplyfyRoles(user.roles),
    };
  }

  static simplyfyRoles(roles: Role[]) {
    return roles.map(({ updatedAt, createdAt, ...roleData }) => {
      return roleData;
    });
  }

  static simplyfyRole(role: Role) {
    const { updatedAt, createdAt, ...roleData } = role;
    return roleData;
  }
}
