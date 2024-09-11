import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/request';
import { LoginResponseDto } from './dto/response';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';

@ApiTags('Auth')
@ApiResponse({ status: 400, description: '유효성 검사 실패' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 404, description: '유저 없음' })
  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 409, description: '유저 이미 존재' })
  @Post('signup')
  async signup(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.signup(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('test')
  test(@CurrentUser() id: string) {
    console.log(id);
  }
}
