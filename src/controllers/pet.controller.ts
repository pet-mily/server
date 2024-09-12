import {
  Controller,
  UseGuards,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PetService } from 'src/providers/pet.service';
import { JwtGuard } from 'src/common/guards';
import { CreatePetDto } from './dto/pet/request';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators';

@ApiTags('Pets')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('pets')
export class PetController {
  constructor(private petService: PetService) {}

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
}
