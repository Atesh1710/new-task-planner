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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Get('date/:date')
  findByDate(@Request() req, @Param('date') date: string) {
    return this.tasksService.findByDate(req.user.userId, date);
  }

  @Get('range')
  findByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.tasksService.findByDateRange(req.user.userId, startDate, endDate);
  }

  @Get('category/:category')
  findByCategory(@Request() req, @Param('category') category: string) {
    return this.tasksService.findByCategory(req.user.userId, category);
  }

  @Get('stats')
  getStats(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.tasksService.getStats(req.user.userId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(req.user.userId, id, updateTaskDto);
  }

  @Patch(':id/toggle')
  toggleComplete(@Request() req, @Param('id') id: string) {
    return this.tasksService.toggleComplete(req.user.userId, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(req.user.userId, id);
  }
}
