import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Owner Module — encapsulates all Store-Owner dashboard functionality.
 *
 * Endpoints:
 *   GET /api/owner/dashboard/stats   → aggregate metrics
 *   GET /api/owner/dashboard/ratings → paginated ratings table
 */
@Module({
  imports: [PrismaModule],
  controllers: [OwnerController],
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule {}
