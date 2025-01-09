import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { ImageDto } from "./dto/image.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "./entities/image.entity";
import { Repository } from "typeorm";
import { MulterFile } from "src/common/utils/multer.util";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private request: Request
  ) {}

  async create(imageDto: ImageDto, image: MulterFile) {
    const userId = this?.request?.user?.id;
    const { name, alt } = imageDto;
    let location = image?.path?.slice(7).replaceAll("\\", "/");
    await this.imageRepository.insert({
      alt: alt || name,
      name,
      location,
      userId,
    });

    return {
      message: PublicMessage.Created,
    };
  }

  async findAll() {
    const userId = this?.request?.user?.id;
    return await this.imageRepository.find({
      where: { userId },
      order: { id: "DESC" },
    });
  }

  async findOne(id: number) {
    const userId = this?.request?.user?.id;
    const image = await this.imageRepository.find({
      where: { userId, id },
      order: { id: "DESC" },
    });
    if (!image) throw new NotFoundException(NotFoundMessage.Any);
    return image;
  }

  async remove(id: number) {
    const image = await this.findOne(id);
    await this.imageRepository.remove(image);
    return {
      message: PublicMessage.Deleted,
    };
  }
}
