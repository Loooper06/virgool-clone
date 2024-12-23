import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";
import { isEmail, isMobilePhone, isString } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "../user/entities/profile.entity";
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { OtpEntity } from "../user/entities/otp.entity";
import { randomInt } from "crypto";
import { TokenService } from "./token.service";
import { Request, Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { AuthResponse } from "./types/response";
import { REQUEST } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService
  ) {}
  async userExistence(authDto: AuthDto, response: Response) {
    const { username, method, type } = authDto;
    let result: AuthResponse;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        return this.sendResponse(response, result);
      case AuthType.Register:
        result = await this.register(method, username);
        return this.sendResponse(response, result);
      default:
        throw new UnauthorizedException();
    }
  }
  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    const user = await this.checkUserExist(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.SaveOtp(user.id);
    const token = this.tokenService.genOtpToken({ userId: user.id });
    return {
      code: otp.code,
      token,
    };
  }
  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user = await this.checkUserExist(method, validUsername);
    if (user) throw new ConflictException(AuthMessage.ConflictAccount);

    if (method === AuthMethod.Username)
      throw new BadRequestException(BadRequestMessage.InValidRegisterData);

    user = this.userRepository.create({
      [method]: username,
    });

    user = await this.userRepository.save(user);
    user.username = String("vr_" + user.id);
    await this.userRepository.save(user);
    const otp = await this.SaveOtp(user.id);
    const token = this.tokenService.genOtpToken({ userId: user.id });
    return {
      code: otp.code,
      token,
    };
  }
  async sendResponse(response: Response, result: AuthResponse) {
    const { token, code } = result;
    response.cookie(CookieKeys.Otp, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 2),
    });
    return response.json({
      code,
    });
  }
  async checkOtp(code: string) {
    const token = this.request.cookies?.[CookieKeys.Otp];
    if (!token) throw new UnauthorizedException(AuthMessage.CodeExpired);
    const { userId } = this.tokenService.verifyOtpToken(token);
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(AuthMessage.LoginAgain);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new UnauthorizedException(AuthMessage.CodeExpired);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.TryAgain);

    const accessToken = this.tokenService.genAccessToken({ userId });

    return {
      message: PublicMessage.LoggedIn,
      accessToken,
    };
  }
  async checkLogin() {}
  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException("Email Format is not correct");

      case AuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException("Phone Format is not correct");

      case AuthMethod.Username:
        return username;

      default:
        throw new UnauthorizedException("username data is not valid");
    }
  }
  async checkUserExist(method: AuthMethod, username: string) {
    let user: UserEntity;
    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({
        phone: username,
      });
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({
        email: username,
      });
    } else if (method === AuthMethod.Username) {
      user = await this.userRepository.findOneBy({
        username,
      });
    } else throw new BadRequestException(BadRequestMessage.InValidLoginData);

    return user;
  }
  async SaveOtp(userId: number) {
    const code = randomInt(10000, 99999).toString();
    let otp = await this.otpRepository.findOneBy({ userId });
    let isOtpExist = false;
    const expiresIn = new Date(Date.now() + 1000 * 60 * 2);
    if (otp) {
      isOtpExist = true;
      otp.code = code;
      otp.expiresIn = expiresIn;
    } else {
      otp = this.otpRepository.create({
        code,
        expiresIn,
        userId,
      });
    }
    otp = await this.otpRepository.save(otp);
    if (!isOtpExist)
      await this.userRepository.update({ id: userId }, { otpId: otp.id });
    return otp;
  }
  async validateAccessToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }
}
