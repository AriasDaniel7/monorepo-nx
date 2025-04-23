import { IsEmail, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  //   @IsString()
  //   taxId: string;

  @IsNumber()
  @Min(0)
  @Max(80)
  age: number;

  @IsString()
  bloodType: string;
}
