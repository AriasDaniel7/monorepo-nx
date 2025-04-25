import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  //   @IsString()
  //   taxId: string;

  @IsNumber()
  @Min(0)
  @Max(80)
  age!: number;

  @IsString()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodType!: string;

  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  @IsIn(['admin', 'user'], { each: true })
  roles?: string[];
}
