import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Signal, User } from './app.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Signal') private signalModel: Model<Signal>,
    private jwtService: JwtService,
  ) {}

  hello(): string {
    return `Signal server works: ${process.uptime()}`;
  }

  async registerToken(username: string) {
    const user = await this.userModel.findOne({ username });
    if (user) {
      throw new UnauthorizedException('User already exists');
    }
    const token = this.jwtService.sign(
      { username },
      { secret: process.env.JWT_SECRET || 'defaultSecret' },
    );
    await this.userModel.updateOne({ username }, { token });
    return token;
  }

  async updateToken(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const token = this.jwtService.sign(
      { username },
      { secret: process.env.JWT_SECRET || 'defaultSecret' },
    );
    await this.userModel.updateOne({ username }, { token });
    return token;
  }

  async generateToken(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user || !(await bcrypt.compare(username, user.username))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign(
      { username },
      { secret: process.env.JWT_SECRET || 'defaultSecret' },
    );
    await this.userModel.updateOne({ username }, { token });
    return token;
  }

  async getAllTokens() {
    return this.userModel.find({}, 'username token');
  }

  async deleteToken(username: string) {
    return this.userModel.updateOne({ username }, { $unset: { token: 1 } });
  }
}
