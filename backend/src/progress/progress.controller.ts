import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(AuthGuard('jwt'))
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('daily/:date')
  getDailyProgress(@Request() req, @Param('date') date: string) {
    return this.progressService.getDailyProgress(req.user.userId, date);
  }

  @Get('weekly')
  getWeeklyProgress(@Request() req, @Query('startDate') startDate: string) {
    return this.progressService.getWeeklyProgress(req.user.userId, startDate);
  }

  @Get('monthly')
  getMonthlyProgress(
    @Request() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.progressService.getMonthlyProgress(req.user.userId, parseInt(year), parseInt(month));
  }

  @Get('yearly')
  getYearlyProgress(@Request() req, @Query('year') year: string) {
    return this.progressService.getYearlyProgress(req.user.userId, parseInt(year));
  }

  @Get('habit/:id/logs')
  getHabitLogs(
    @Request() req,
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.progressService.getHabitLogs(req.user.userId, id, startDate, endDate);
  }
}
