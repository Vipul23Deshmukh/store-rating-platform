import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '../../common/constants/roles.enum';

/**
 * Ratings controller.
 * Handles rating submission (upsert), retrieval, and deletion.
 */
@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /**
   * POST /api/ratings
   * Normal users only — Submit or update a store rating (upsert behaviour).
   * First submission creates, subsequent submissions update the existing rating.
   */
  @Post()
  @Roles(Role.USER)
  async submitRating(
    @Body() createRatingDto: CreateRatingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.submitRating(createRatingDto, userId);
  }

  /**
   * PUT /api/ratings/:id
   * Normal users only — Update own rating by rating ID.
   */
  @Put(':id')
  @Roles(Role.USER)
  async update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.update(id, updateRatingDto, userId);
  }

  /**
   * GET /api/ratings/store/:storeId
   * All authenticated users — Get all ratings for a store.
   */
  @Get('store/:storeId')
  async findByStore(@Param('storeId') storeId: string) {
    return this.ratingsService.findByStore(storeId);
  }

  /**
   * GET /api/ratings/my-rating/:storeId
   * Normal users only — Get the current user's personal rating for a specific store.
   */
  @Get('my-rating/:storeId')
  @Roles(Role.USER)
  async getMyRating(
    @Param('storeId') storeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.getMyRating(storeId, userId);
  }

  /**
   * DELETE /api/ratings/:id
   * Admin only — Remove a rating.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.ratingsService.remove(id);
  }
}
