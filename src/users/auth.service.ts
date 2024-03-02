import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly usersSerice: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersSerice.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    const user = await this.usersSerice.create(email, result);

    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersSerice.find(email);
    if (!user) {
      throw new NotFoundException('invalid email');
    }

    const [salt, hash] = user.password.split('.');
    const rehash = (await scrypt(password, salt, 32)) as Buffer;
    if (rehash.toString('hex') === hash) {
      return user;
    }
    throw new BadRequestException('invalid email/password');
  }
}
