import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppService } from './app.service';
import { Signal } from './app.interface';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHello(): string {
    return this.appService.hello();
  }
}

@Controller('auth')
export class AuthController {
  constructor(private service: AppService) {}

  @Post('register')
  async register(@Body() body: { username: string }) {
    return {
      token: await this.service.registerToken(body.username),
    };
  }

  @Post('update-token')
  async updateToken(@Body() body: { username: string }) {
    return {
      token: await this.service.updateToken(body.username),
    };
  }

  @Post('login')
  async login(@Body() body: { username: string }) {
    return {
      token: await this.service.generateToken(body.username),
    };
  }

  @Get('tokens')
  async getTokens() {
    return this.service.getAllTokens();
  }

  @Delete('tokens')
  async deleteToken(@Body() body: { username: string }) {
    return this.service.deleteToken(body.username);
  }
}

@Controller('signals')
export class SignalController {
  constructor(
    @InjectModel('Signal') private signalModel: Model<Signal>,
    private jwtService: JwtService,
  ) {}

  @Post('process')
  async processSignal(
    @Headers('Authorization') auth: string,
    @Body() signal: Signal,
  ) {
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException();
    const token = auth.split(' ')[1];
    try {
      this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException();
    }
    await this.signalModel.create(signal);
    return { message: 'Signal processed', signal };
  }

  @Post('get-user-signal')
  async getUserSignal(
    @Headers('Authorization') auth: string,
    @Body() signal: Signal,
  ) {
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException();
    const token = auth.split(' ')[1];
    try {
      this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException();
    }

    await this.signalModel.find({ username: signal.client_id });

    return { message: 'Signals', signal };
  }

  @Get('all')
  async getAllSignals() {
    return this.signalModel.find();
  }
}
