import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Controller('habits')
@UseGuards(AuthGuard('jwt'))
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@Request() req, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create(req.user.userId, createHabitDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.habitsService.findAll(req.user.userId);
  }

  @Get('active')
  findActive(@Request() req) {
    return this.habitsService.findActive(req.user.userId);
  }

  @Get('category/:category')
  findByCategory(@Request() req, @Param('category') category: string) {
    return this.habitsService.findByCategory(req.user.userId, category);
  }

  @Get('stats')
  getStats(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.habitsService.getStats(req.user.userId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.habitsService.findOne(req.user.userId, id);
  }

  @Get(':id/progress')
  getProgress(
    @Request() req,
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.habitsService.getHabitProgress(req.user.userId, id, startDate, endDate);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateHabitDto: UpdateHabitDto) {
    return this.habitsService.update(req.user.userId, id, updateHabitDto);
  }

  @Patch(':id/toggle/:date')
  toggleComplete(@Request() req, @Param('id') id: string, @Param('date') date: string) {
    return this.habitsService.toggleComplete(req.user.userId, id, date);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.habitsService.remove(req.user.userId, id);
  }
}
