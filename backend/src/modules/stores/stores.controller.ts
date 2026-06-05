import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, StoreQueryDto, OwnerRatingsQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '../../common/constants/roles.enum';

/**
 * Stores controller.
 * Handles store CRUD with role-based access.
 */
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  /**
   * GET /api/stores
   * All authenticated users — list stores with search, filters, pagination.
   * Includes the current user's personal rating for each store.
   */
  @Get()
  async findAll(
    @Query() query: StoreQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.storesService.findAll(query, userId);
  }
  @Get('owner/stats')
  @Roles(Role.STORE_OWNER)
  async getOwnerStats(
    @CurrentUser('id') ownerId: string,
  ) {
    return this.storesService.getOwnerStats(ownerId);
  }

  @Get('owner/ratings')
  @Roles(Role.STORE_OWNER)
  async getOwnerRatings(
    @CurrentUser('id') ownerId: string,
    @Query() query: OwnerRatingsQueryDto,
  ) {
    return this.storesService.getOwnerRatings(ownerId, query);
  }

  /**
   * GET /api/stores/:id
   * All authenticated users — get full store details including user's own rating.
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.storesService.findOne(id, userId);
  }

  /**
   * POST /api/stores
   * Admin & Store Owner — create a new store.
   */
  @Post()
  @Roles(Role.ADMIN, Role.STORE_OWNER)
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.storesService.create(createStoreDto, userId);
  }

  /**
   * PUT /api/stores/:id
   * Admin & Store Owner — update a store.
   */
  @Put(':id')
  @Roles(Role.ADMIN, Role.STORE_OWNER)
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  /**
   * DELETE /api/stores/:id
   * Admin only — delete a store.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
