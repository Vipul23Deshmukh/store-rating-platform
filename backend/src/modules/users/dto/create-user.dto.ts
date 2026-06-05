import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Role } from '../../../common/constants/roles.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(60, { message: 'Name cannot exceed 60 characters.' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be between 8 and 16 characters.' })
  @MaxLength(16, { message: 'Password must be between 8 and 16 characters.' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message: 'Password must contain at least one uppercase letter and one special character.',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters.' })
  address: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
