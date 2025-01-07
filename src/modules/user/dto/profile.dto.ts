import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  Length,
} from "class-validator";
import { Gender } from "../enum/gender.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

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

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: ValidationMessage.EMAIL_INVALID })
  email: string;
}

export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone("fa-IR", {}, { message: ValidationMessage.PHONE_INVALID })
  phone: string;
}
