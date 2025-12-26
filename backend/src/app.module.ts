import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { HabitsModule } from './habits/habits.module';
import { ProgressModule } from './progress/progress.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/habitTracker',
        maxPoolSize: parseInt(configService.get<string>('DB_POOL_SIZE') || '10'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TasksModule,
    HabitsModule,
    ProgressModule,
    CategoriesModule,
  ],
})
export class AppModule {}
