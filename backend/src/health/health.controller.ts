import { Controller, Get } from '@nestjs/common';

/**
 * Health check controller.
 * Provides a simple endpoint for monitoring/health probes.
 */
@Controller('health')
export class HealthController {
  /**
   * GET /api/health
   * Public - Health check endpoint
   */
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'store-rating-api',
      timestamp: new Date().toISOString(),
    };
  }
}
