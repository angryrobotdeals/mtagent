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
import { generateRandomUUID } from './const';

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
      { name: 'History', schema: SignalSchema },
    ]),
  ],
  controllers: [AppController, AuthController, SignalController],
  providers: [JwtService, AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Signal') private signalModel: Model<Signal>,
  ) {}

  async onModuleInit() {
    const existingUser = await this.userModel.findOne({ username: 'admin' });
    if (!existingUser) {
      const token = generateRandomUUID();
      await this.userModel.create({
        username: 'admin',
        token,
      });
    }
  }
}
