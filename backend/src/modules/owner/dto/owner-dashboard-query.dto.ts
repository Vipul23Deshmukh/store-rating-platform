import { IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query DTO for paginating and sorting the owner's ratings table.
 *
 * sortBy supports relational sorting:
 *   - userName / userEmail  → sorted via the related User model
 *   - storeName             → sorted via the related Store model
 *   - value / createdAt     → sorted on the Rating model directly
 */
export class OwnerRatingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['userName', 'userEmail', 'storeName', 'value', 'createdAt'])
  sortBy?: 'userName' | 'userEmail' | 'storeName' | 'value' | 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
