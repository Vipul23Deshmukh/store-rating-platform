import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
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
  @MaxLength(400, { message: 'Address cannot exceed 400 characters.' })
  address: string;
}
