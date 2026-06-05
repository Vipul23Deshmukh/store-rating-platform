import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerRatingsQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '../../common/constants/roles.enum';

/**
 * Store-Owner Dashboard controller.
 *
 * Base path: /api/owner
 * All endpoints are protected and restricted to the STORE_OWNER role.
 */
@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STORE_OWNER)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  /**
   * GET /api/owner/dashboard/stats
   *
   * Returns aggregate metrics for the authenticated owner:
   *   { totalStores, totalRatings, averageRating }
   */
  @Get('dashboard/stats')
  async getDashboardStats(@CurrentUser('id') ownerId: string) {
    return this.ownerService.getDashboardStats(ownerId);
  }

  /**
   * GET /api/owner/dashboard/ratings
   *
   * Returns a paginated, sortable list of ratings submitted
   * to any store belonging to the authenticated owner.
   *
   * Query params:
   *   page      — page number (1-indexed, default 1)
   *   limit     — rows per page  (default 10)
   *   sortBy    — userName | userEmail | storeName | value | createdAt
   *   sortOrder — asc | desc  (default desc)
   *
   * Response shape:
   *   {
   *     ratings: [{ id, value, comment, createdAt, user: {…}, store: {…} }],
   *     meta:    { total, page, limit, totalPages }
   *   }
   */
  @Get('dashboard/ratings')
  async getDashboardRatings(
    @CurrentUser('id') ownerId: string,
    @Query() query: OwnerRatingsQueryDto,
  ) {
    return this.ownerService.getRatings(ownerId, query);
  }
}
