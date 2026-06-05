import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/constants/roles.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /api/admin/dashboard
   * Admin only - Retrieve global counts of users, stores, and reviews
   */
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
