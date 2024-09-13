import {
  Controller,
  UseGuards,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { PetService } from 'src/providers/pet.service';
import { JwtGuard } from 'src/common/guards';
import { CreatePetDto } from './dto/pet/request';
import { FindManyPetDto, GetPetDetailDto } from './dto/pet/response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators';

@ApiTags('Pets')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'accessToken 재발급해야함' })
@ApiResponse({ status: 400, description: '유효성 검사 실패' })
@UseGuards(JwtGuard)
@Controller('pets')
export class PetController {
  constructor(private petService: PetService) {}

  @ApiOperation({ summary: '반려동물 등록' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePetDto,
    description: '반려동물 등록',
  })
  @ApiResponse({
    status: 201,
    description: '반려동물 등록 성공 - 따로 응답 body는 없습니다.',
  })
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createPetDto: CreatePetDto,
    @UploadedFile() image: Express.Multer.File,
    @CurrentUser() userId: number,
  ) {
    if (!image) {
      throw new HttpException('Bad Request', 400);
    }

    await this.petService.create(userId.toString(), {
      ...createPetDto,
      image,
    });
    return;
  }

  @ApiOperation({ summary: '내 반려동물 리스트 조회' })
  @ApiResponse({
    status: 200,
    description: '내 반려동물 리스트 조회 성공',
    type: FindManyPetDto,
    isArray: true,
  })
  @Get()
  async findManyByUserId(@CurrentUser() id: string): Promise<FindManyPetDto[]> {
    return this.petService.getManyByUserId(id);
  }

  @ApiOperation({ summary: '반려동물 상세 조회' })
  @ApiParam({ name: 'id', description: '반려동물 id' })
  @ApiResponse({
    status: 200,
    description: '반려동물 상세 조회 성공',
    type: GetPetDetailDto,
  })
  @ApiResponse({ status: 404, description: '반려동물 없음' })
  @Get(':id')
  async findOneById(@Param('id') petId: string): Promise<GetPetDetailDto> {
    return await this.petService.getOneById(petId);
  }
}
