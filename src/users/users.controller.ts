import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  UseInterceptors,
  NotFoundException,
  Session,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
  Serialize,
  SerializeInterceptor,
} from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';

@Serialize(UserDto)
@UseGuards(AuthGuard)
@Controller('auth')
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  // @Get('whoami')
  // whoAmI(@Session() session: any) {
  //   return this.userService.findOne(session.userId);
  // }

  @Get('whoami')
  whoAmI(@CurrentUser() user: any) {
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  // @Serialize(UserDto)===> @UseInterceptors(new SerializeInterceptor(UserDto))
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() attrs: UpdateUserDto) {
    return this.userService.update(+id, attrs);
  }
}
