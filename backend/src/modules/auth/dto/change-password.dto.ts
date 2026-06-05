import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be between 8 and 16 characters.' })
  @MaxLength(16, { message: 'New password must be between 8 and 16 characters.' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message: 'New password must contain at least one uppercase letter and one special character.',
  })
  newPassword: string;
}
