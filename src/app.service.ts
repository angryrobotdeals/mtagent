import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Signal, User } from './app.interface';
import { generateRandomUUID } from './const';
import { ObjectId } from 'mongodb';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Signal') private signalModel: Model<Signal>,
  ) {}

  async hello(): Promise<string> {
    return `
    Signal server works: ${process.uptime()}\n
    Users: ${await this.userModel.countDocuments()}\n
    Signals: ${await this.signalModel.countDocuments()}\n
    `;
  }

  async registerToken(username: string) {
    const user = await this.userModel.findOne({ username });
    if (user) {
      throw new UnauthorizedException('User already exists');
    }
    const token = generateRandomUUID();
    const doc = await this.userModel
      .create({ username, token })
      .catch((err) => {
        console.error('Error creating user', err);
        return null;
      });
    if (!doc) {
      console.error('Error creating user', username);
      return null;
    }

    return token;
  }

  async updateToken(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const token = generateRandomUUID();
    await this.userModel.updateOne({ username }, { token });
    return token;
  }

  async generateToken(username: string) {
    const user = await this.getUser(username);
    if (!user?.token?.length) {
      throw new UnauthorizedException('User does not exist');
    }

    const token = generateRandomUUID();

    await this.userModel.updateOne({ username }, { token });

    return token;
  }

  async login({ username }: { username: string }) {
    console.log('Login:', username);

    const user = await this.getUser(username);
    if (!user) {
      console.error('Login: User does not exist', username);
      return { message: `User does not exist: ${username}` };
    }

    return { message: 'Logged in', token: user.token };
  }

  async getUserToken(username: string) {
    const user = await this.getUser(username);
    if (!user?.token?.length) {
      console.log('User does not exist', username);
      return null;
    }

    return user.token;
  }

  async getAllTokens() {
    return this.userModel.find({}, 'username token');
  }

  async deleteToken(username: string) {
    return this.userModel.deleteOne({ username });
  }

  async createSignal(signal: Signal) {
    return this.signalModel
      .create({ ...signal, signal_id: generateRandomUUID() })
      .then((s) => ({ message: 'Signal created', signal: s }))
      .catch((err) => {
        console.error('Error creating signal', err);

        return { message: 'Error creating signal', signal };
      });
  }

  async getSignals(username: string): Promise<Signal[]> {
    console.log('Get signals:', username);
    return this.signalModel
      .find<Signal>({ client_id: username })
      .then((signals) => {
        return signals.filter((s) => {
          const id = new ObjectId(s['_id']);
          return id.getTimestamp().getTime() > Date.now() - 1000 * 30; // 7 days
        });
      })
      .catch((err) => {
        console.error('Error getting signals', err);
        return [];
      });
  }

  async getAllSignals(): Promise<Signal[]> {
    return this.signalModel
      .find<Signal>()
      .then((signals) => signals)
      .catch((err) => {
        console.error('Error getting signals', err);
        return [];
      });
  }

  async getUser(username: string): Promise<User | null> {
    return this.userModel
      .findOne<User>({ username })
      .then((user) => user)
      .catch((err) => {
        console.error('Error getting user', err);
        return null;
      });
  }

  async getUserByToken(token: string): Promise<User | null> {
    return this.userModel
      .findOne<User>({ token })
      .then((user) => user)
      .catch((err) => {
        console.error('Error getting user', err);
        return null;
      });
  }
}
