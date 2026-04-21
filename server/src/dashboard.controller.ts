import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  @Get('unified')
  async getUnifiedDashboard() {
    return { success: true, message: 'Use /reports/dashboard' };
  }
}