import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: any; token: string }> {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.userModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    });

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<any> {
    const updateData: any = {};

    if (updateDto.name) {
      updateData.name = updateDto.name;
    }

    if (updateDto.password) {
      updateData.password = await bcrypt.hash(updateDto.password, 12);
    }

    if (updateDto.preferences) {
      updateData.preferences = updateDto.preferences;
    }

    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    return this.sanitizeUser(user);
  }

  async validateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  private sanitizeUser(user: UserDocument): any {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };
  }
}

