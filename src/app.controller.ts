import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { Signal } from './app.interface';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  async getHello(): Promise<string> {
    return this.appService.hello();
  }
}

@Controller('auth')
export class AuthController {
  constructor(private service: AppService) {}

  @Post('register')
  async register(
    @Headers('Authorization') token: string,
    @Body() body: { username: string },
    @Res() res: Response,
  ) {
    if (!token?.includes('Bearer ') || !body?.username) {
      console.error('Unauthorized', token, body);
      return res.status(401).send('Unauthorized');
    }

    const registerRes = {
      token: await this.service.registerToken(body.username),
    };

    console.log('Register:', registerRes);

    return res.status(registerRes ? 200 : 401).json(registerRes);
  }

  @Post('update-token')
  async updateToken(
    @Headers('Authorization') token: string,
    @Body() body: { username: string },
    @Res() res: Response,
  ) {
    if (!token?.includes('Bearer ') || !body?.username) {
      console.error('Unauthorized', token, body);
      return res.status(401).send('Unauthorized');
    }

    const updateRes = {
      token: await this.service.updateToken(body.username),
    };

    console.log('Update:', updateRes);

    return res.status(updateRes ? 200 : 401).json(updateRes);
  }

  @Post('login')
  async login(
    @Headers('Authorization') token: string,
    @Body() body: { username: string },
    @Res() res: Response,
  ) {
    if (!token?.includes('Bearer ') || !body?.username) {
      console.error('Unauthorized', token, body);
      return res.status(401).send('Unauthorized');
    }

    const admin = await this.service.getUser('admin');
    if (!admin) throw new UnauthorizedException('Admin not found');
    if (admin.token !== token.split('Bearer ')[1])
      throw new UnauthorizedException(
        `Invalid token: ${token}, ${admin.token}`,
      );

    const loginRes = await this.service.login({
      username: body.username,
    });

    console.log('Login:', loginRes);

    if (!loginRes) {
      console.error('Unauthorized', token, body);
      return res.status(401).send('Unauthorized');
    }

    return res.status(200).json(loginRes);
  }

  @Get('tokens')
  async getTokens(@Headers('Authorization') token: string) {
    if (!token?.includes('Bearer ')) {
      console.error('Unauthorized', token);
      return {
        message: 'Unauthorized',
      };
    }

    return this.service.getAllTokens();
  }

  @Delete('token/:username')
  async deleteToken(
    @Headers('Authorization') token: string,
    @Param('username') username: string,
  ) {
    if (!token?.includes('Bearer ') || !username) {
      console.error('Unauthorized', token, username);
      return {
        message: 'Unauthorized',
      };
    }

    return this.service.deleteToken(username);
  }
}

@Controller('order')
export class OrderController {
  constructor(private service: AppService) {}

  @Post('history')
  async postHistory(
    @Headers('Authorization') token: string,
    @Body() body: { username: string; history: any[] },
  ) {
    if (!token?.includes('Bearer ') || !body?.username || !body?.history) {
      console.error('Unauthorized', token, body);
      return {
        message: 'Unauthorized',
      };
    }
    if (!body?.history?.length) {
      console.error('Empty history', token, body);
      return {
        message: 'Empty history',
      };
    }

    const user = await this.service.getUserByToken(token.split('Bearer ')[1]);
    if (!user)
      throw new UnauthorizedException(`User not found with token: ${token}`);

    // return this.service.postHistory(user.username, body.history);
  }
}

@Controller('signal')
export class SignalController {
  constructor(private readonly service: AppService) {}

  @Post('create-signal')
  async createSignal(
    @Headers('Authorization') token: string,
    @Body() signal: Signal,
  ) {
    if (!token?.includes('Bearer ') || !signal?.client_id) {
      console.error('Unauthorized', token, signal);
      return { message: 'Unauthorized' };
    }

    const admin = await this.service.getUser('admin');
    if (!admin) throw new UnauthorizedException('Admin not found');
    if (admin.token !== token.split('Bearer ')[1])
      throw new UnauthorizedException(
        `Invalid token: ${token}, ${admin.token}`,
      );

    return this.service.createSignal(signal);
  }

  @Get('')
  async getSignalsWelcome() {
    return 'Signals API';
  }

  @Get('get-user-signals')
  async getUserSignals(@Headers('Authorization') token: string) {
    if (!token?.includes('Bearer ') || !token.split('Bearer ')?.[1]?.length) {
      console.error('Unauthorized');
      return { message: 'Unauthorized' };
    }

    console.log('Get user signals:', token);
    const user = await this.service.getUserByToken(token.split('Bearer ')[1]);
    if (!user)
      throw new UnauthorizedException(`User not found with token: ${token}`);

    return this.service.getSignals(user.username);
  }

  @Get('get-all-signals')
  async getAllSignals() {
    return this.service.getAllSignals();
  }
}
