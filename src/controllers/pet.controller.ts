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
  Patch,
  Put,
  HttpCode,
  Delete,
  Query,
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
import {
  CreatePetDto,
  UpdatePetImageDto,
  UpdatePetDto,
  GetBreedsDto,
} from './dto/pet/request';
import {
  FindManyPetDto,
  GetPetDetailDto,
  UpdatePetImageResponseDto,
} from './dto/pet/response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators';

@ApiTags('pets')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'accessToken 재발급해야함' })
@ApiResponse({ status: 400, description: '유효성 검사 실패' })
@UseGuards(JwtGuard)
@Controller('pets')
export class PetController {
  constructor(private petService: PetService) {}

  @ApiOperation({ summary: '반려동물 등록' })
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
    @CurrentUser() userId: string,
  ) {
    if (!image) {
      throw new HttpException('이미지가 없습니당', 400);
    }

    await this.petService.create(userId, {
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

  @ApiOperation({ description: '품종 리스트 조회' })
  @ApiParam({ name: 'type', enum: ['DOG', 'CAT'] })
  @ApiResponse({
    status: 200,
    description: '품종 리스트 조회 성공',
    type: String,
    isArray: true,
  })
  @Get('breeds')
  getBreeds(@Query() { type }: GetBreedsDto) {
    return this.petService.getBreeds(type);
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

  @ApiOperation({ summary: '반려동물 이미지 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: '반려동물 id' })
  @ApiBody({
    type: UpdatePetImageDto,
    description: '반려동물 이미지 수정',
  })
  @ApiResponse({
    status: 200,
    description: '반려동물 이미지 수정 성공',
    type: UpdatePetImageResponseDto,
  })
  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id') petId: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UpdatePetImageResponseDto> {
    if (!image) {
      throw new HttpException('Bad Request', 400);
    }

    return await this.petService.updateImage(petId, image);
  }

  @ApiOperation({ summary: '반려동물 정보 수정' })
  @ApiParam({ name: 'id', description: '반려동물 id' })
  @ApiBody({
    type: UpdatePetDto,
    description: '반려동물 정보 수정',
  })
  @ApiResponse({
    status: 204,
    description: '반려동물 정보 수정 성공 - 따로 응답 body는 없습니다.',
  })
  @HttpCode(204)
  @Put(':id')
  async update(
    @Param('id') petId: string,
    @Body() updatePetDto: UpdatePetDto,
    @CurrentUser() userId: string,
  ) {
    await this.petService.update({
      ...updatePetDto,
      petId,
      userId,
    });
    return;
  }

  @ApiOperation({ summary: '반려동물 삭제' })
  @ApiParam({ name: 'id', description: '반려동물 id' })
  @ApiResponse({
    status: 204,
    description: '반려동물 삭제 성공 - 따로 응답 body는 없습니다.',
  })
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id') petId: string, @CurrentUser() userId: string) {
    await this.petService.deleteOne(petId, userId);
    return;
  }
}
