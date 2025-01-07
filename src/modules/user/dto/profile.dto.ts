import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, Length } from "class-validator";
import { Gender } from "../enum/gender.enum";

export class ProfileDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Length(2, 100)
  nickname: string;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Length(10, 300)
  bio: string;
  @ApiPropertyOptional({ nullable: true, format: "binary" })
  image_profile: string;
  @ApiPropertyOptional({ nullable: true, format: "binary" })
  bg_image: string;
  @ApiPropertyOptional({ nullable: true, example: "2000-04-14T19:08:19.676Z" })
  birthdate: Date;
  @ApiPropertyOptional({ nullable: true, enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender: string;
  @ApiPropertyOptional({ nullable: true })
  linkedIn_link: string;
  @ApiPropertyOptional({ nullable: true })
  x_link: string;
}
