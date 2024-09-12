import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from './dto/request';
import { LoginResponseDto } from './dto/response';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtGuard, RefreshGuard } from 'src/common/guards';
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

  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '새로운 accessToken, refreshToken을 반환해서 드립니다',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: '토큰 유효하지 않음' })
  @ApiHeader({
    name: 'Authorization',
    description:
      '여기도 다른 헤더와 같이 Authorization: Bearer 이지만 accessToken이 아니라 refreshToken을 넣어주셔야 합니다',
  })
  @ApiBearerAuth()
  @UseGuards(RefreshGuard)
  @Patch('refresh')
  async refresh(
    @CurrentUser() id: string,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const refreshToken = req.headers.authorization!.split(' ')[1];
    return await this.authService.refresh(id, refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('test')
  test(@CurrentUser() id: string) {
    console.log(id);
  }
}
