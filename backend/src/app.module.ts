import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StoresModule } from './modules/stores/stores.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { AdminModule } from './modules/admin/admin.module';
import { OwnerModule } from './modules/owner/owner.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Core infrastructure
    AppConfigModule,
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    StoresModule,
    RatingsModule,
    AdminModule,
    OwnerModule,

    // Utility modules
    HealthModule,
  ],
})
export class AppModule {}
