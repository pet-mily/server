import {
  Controller,
  Delete,
  UseGuards,
  HttpCode,
  Put,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { UserService } from 'src/providers/user.service';
import { UpdateUserDto } from './dto/user/request';

@ApiTags('users')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: '유효성 검사 실패' })
@ApiResponse({ status: 401, description: '인증 실패' })
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 204, description: '회원 탈퇴 성공' })
  @HttpCode(204)
  @Delete('me')
  async delete(@CurrentUser() userId: string) {
    await this.userService.delete(userId);
    return;
  }

  @ApiOperation({ summary: '내 정보 수정' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 204, description: '내 정보 수정 성공' })
  @HttpCode(204)
  @Put('me')
  async update(
    @CurrentUser() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update(userId, updateUserDto);
    return;
  }
}
