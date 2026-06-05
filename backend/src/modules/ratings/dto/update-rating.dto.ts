import { IsInt, Min, Max, IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateRatingDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  value?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;
}
