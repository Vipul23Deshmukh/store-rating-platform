import { IsEmail, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  @MaxLength(60)
  name?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(400)
  address?: string;
}
