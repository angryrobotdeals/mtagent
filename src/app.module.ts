import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { Signal, User } from './app.interface';
import {
  AppController,
  AuthController,
  SignalController,
} from './app.controller';
import * as dotenv from 'dotenv';
import { AppService } from './app.service';

dotenv.config();

const UserSchema = new Schema({
  username: String,
  password: String,
  token: String,
});

const SignalSchema = new Schema({
  signal_id: String,
  client_id: String,
  action: String,
  symbol: String,
  direction: String,
  volume: Number,
  stop_loss: Number,
  take_profit: Number,
  partial_close_pct: Number,
  multi_take_profits: Array,
});

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}`,
      {
        authSource: process.env.MONGODB_AUTH_DB || 'admin',
        authMechanism: 'SCRAM-SHA-256',
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        timeoutMS: 5000,
      },
    ),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Signal', schema: SignalSchema },
    ]),
  ],
  controllers: [AppController, AuthController, SignalController],
  providers: [JwtService, AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Signal') private signalModel: Model<Signal>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const existingUser = await this.userModel.findOne({ username: 'admin' });
    if (!existingUser) {
      const token = this.jwtService.sign(
        {
          username: 'admin',
        },
        {
          secret: process.env.JWT_SECRET || 'defaultSecret',
          algorithm: 'HS256',
        },
      );
      await this.userModel.create({
        username: 'admin',
        token,
      });
    }

    const testSignal = await this.signalModel.findOne({
      signal_id: 'test_001',
    });
    if (!testSignal) {
      await this.signalModel.create({
        signal_id: 'test_001',
        client_id: 'CLIENT_001',
        action: 'open',
        direction: 'buy',
        symbol: 'EURUSD',
        volume: 0.1,
        stop_loss: 1.1,
        take_profit: 1.12,
      });
    }
  }
}
