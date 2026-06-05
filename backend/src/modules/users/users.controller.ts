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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/constants/roles.enum';

/**
 * Users controller.
 * Admin-only endpoints for user management.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/users
   * Admin only - List all users with filtering
   */
  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  /**
   * GET /api/users/:id
   * Admin only - Get user details
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * POST /api/users
   * Admin only - Create a new user
   */
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * PUT /api/users/:id
   * Admin only - Update user
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /api/users/:id
   * Admin only - Delete user
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
