import { IsInt, Min, Max, IsString, IsOptional, MaxLength, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;

  @IsUUID()
  @IsNotEmpty()
  storeId: string;
}
