import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { LoginDto } from './dto/request';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('signup')
  async signup(@Body() loginDto: LoginDto) {
    return await this.authService.signup(loginDto);
  }
}
