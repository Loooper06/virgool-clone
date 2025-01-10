import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiConsumes, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  ProfileDto,
} from "./dto/profile.dto";
import { SwaggerConsumes } from "src/common/enums/swagger.consumes.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/common/utils/multer.util";
import { ProfileImages } from "./types/files";
import { UploadedOptionalFiles } from "src/common/decorators/upload-file.decorator";
import { Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { CookieOptionsToken } from "src/common/utils/cookie.util";
import { PublicMessage } from "src/common/enums/message.enum";
import { CheckOtpDto } from "../auth/dto/auth.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";

@Controller("user")
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put("/profile")
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image_profile", maxCount: 1 },
        { name: "bg_image", maxCount: 1 },
      ],
      {
        storage: multerStorage("user-profile"),
      }
    )
  )
  changeProfile(
    @UploadedOptionalFiles() files: ProfileImages,
    @Body()
    profileDto: ProfileDto
  ) {
    return this.userService.changeProfile(files, profileDto);
  }
  @Patch("/change-email")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { code, message, token } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.EmailOtp, token, CookieOptionsToken());
    res.json({
      code,
      message: PublicMessage.SendOtp,
    });
  }
  @Post("/verify-email-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyEmail(otpDto.code);
  }

  @Patch("/change-phone")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { code, message, token } = await this.userService.changePhone(
      phoneDto.phone
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.PhoneOtp, token, CookieOptionsToken());
    res.json({
      code,
      message: PublicMessage.SendOtp,
    });
  }
  @Post("/verify-phone-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyPhone(otpDto.code);
  }
  @Patch("/change-username")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }

  @Get("/follow/:followingId")
  @ApiParam({ name: "followingId" })
  async follow(@Param("followingId", ParseIntPipe) followingId: number) {
    return this.userService.followToggle(followingId);
  }
}
