import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = new this.categoryModel(createCategoryDto);
      return await category.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ order: 1, name: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findByName(name: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ name }).exec();
    if (!category) {
      throw new NotFoundException(`Category "${name}" not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryModel
        .findByIdAndUpdate(id, updateCategoryDto, { new: true })
        .exec();
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async seedDefaultCategories(): Promise<Category[]> {
    const defaultCategories = [
      { name: 'Work', color: '#3b82f6', icon: 'briefcase', order: 1 },
      { name: 'Fitness', color: '#ef4444', icon: 'dumbbell', order: 2 },
      { name: 'Study', color: '#8b5cf6', icon: 'book', order: 3 },
      { name: 'Health', color: '#10b981', icon: 'heart', order: 4 },
      { name: 'Personal', color: '#f59e0b', icon: 'user', order: 5 },
      { name: 'Social', color: '#ec4899', icon: 'users', order: 6 },
    ];

    const createdCategories = [];
    for (const cat of defaultCategories) {
      const exists = await this.categoryModel.findOne({ name: cat.name }).exec();
      if (!exists) {
        const category = new this.categoryModel(cat);
        createdCategories.push(await category.save());
      }
    }

    return createdCategories;
  }
}

