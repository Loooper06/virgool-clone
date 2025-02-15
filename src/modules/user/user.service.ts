import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { ProfileDto } from "./dto/profile.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "./entities/profile.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { isDate } from "class-validator";
import { Gender } from "./enum/gender.enum";
import { ProfileImages } from "./types/files";
import {
  AuthMessage,
  BadRequestMessage,
  ConflictMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/token.service";
import { OtpEntity } from "./entities/otp.entity";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { AuthMethod } from "../auth/enums/method.enum";
import { FollowEntity } from "./entities/follow.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { BlockDto } from "../auth/dto/auth.dto";
import { ProfileStatus } from "./enum/status.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(FollowEntity)
    private followRepository: Repository<FollowEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  async changeProfile(files: ProfileImages, profileDto: ProfileDto) {
    if (files?.image_profile?.length > 0) {
      let [image] = files?.image_profile;
      profileDto.image_profile = image?.path?.slice(7);
    }
    if (files?.bg_image?.length > 0) {
      let [image] = files?.bg_image;
      profileDto.bg_image = image?.path?.slice(7);
    }

    const { id: userId, profileId } = this.request.user;
    let profile = await this.profileRepository.findOneBy({ id: userId });

    const {
      bio,
      birthdate,
      gender,
      linkedIn_link,
      nickname,
      x_link,
      image_profile,
      bg_image,
    } = profileDto;

    if (profile) {
      if (nickname) profile.nickname = nickname;
      if (bio) profile.bio = bio;
      if (birthdate && isDate(new Date(birthdate)))
        profile.birthdate = birthdate;
      if (gender && Object.values(Gender as any).includes(gender))
        profile.bio = bio;
      if (linkedIn_link) profile.linkedIn_link = linkedIn_link;
      if (x_link) profile.x_link = x_link;
      if (bg_image) profile.bg_image = bg_image;
      if (image_profile) profile.image_profile = image_profile;
    } else {
      profile = this.profileRepository.create({
        userId,
        bio,
        birthdate,
        gender,
        linkedIn_link,
        nickname,
        x_link,
        image_profile,
        bg_image,
      });
    }

    profile = await this.profileRepository.save(profile);

    if (!profileId)
      await this.userRepository.update(
        { id: userId },
        { profileId: profile.id }
      );

    return { message: PublicMessage.Updated };
  }
  async changeEmail(email: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ email });
    if (user && user?.id !== id)
      throw new ConflictException(ConflictMessage.Email);
    else if (user && user?.id === id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    await this.userRepository.update({ id }, { new_email: email });
    const otp = await this.authService.SaveOtp(id, AuthMethod.Email);
    const token = this.tokenService.genEmailToken({ email });

    return {
      code: otp.code,
      token,
    };
  }
  async verifyEmail(code: string) {
    const { id: userId, new_email } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.EmailOtp];
    if (!token) throw new BadRequestException(AuthMessage.CodeExpired);
    const { email } = this.tokenService.verifyEmailToken(token);
    if (email !== new_email)
      throw new BadRequestException(BadRequestMessage.SomeThingWentWrong);
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Email)
      throw new BadRequestException(BadRequestMessage.SomeThingWentWrong);
    await this.userRepository.update(
      { id: userId },
      { email, verify_email: true, new_email: null }
    );

    return {
      message: PublicMessage.Updated,
    };
  }
  async changePhone(phone: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ phone });
    if (user && user?.id !== id)
      throw new ConflictException(ConflictMessage.Phone);
    else if (user && user?.id === id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    await this.userRepository.update({ id }, { new_phone: phone });
    const otp = await this.authService.SaveOtp(id, AuthMethod.Phone);
    const token = this.tokenService.genPhoneToken({ phone });

    return {
      code: otp.code,
      token,
    };
  }
  async verifyPhone(code: string) {
    const { id: userId, new_phone } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.PhoneOtp];
    if (!token) throw new BadRequestException(AuthMessage.CodeExpired);
    const { phone } = this.tokenService.verifyPhoneToken(token);
    if (phone !== new_phone)
      throw new BadRequestException(BadRequestMessage.SomeThingWentWrong);
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Phone)
      throw new BadRequestException(BadRequestMessage.SomeThingWentWrong);
    await this.userRepository.update(
      { id: userId },
      { phone, verify_phone: true, new_phone: null }
    );

    return {
      message: PublicMessage.Updated,
    };
  }
  async changeUsername(username: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ username });
    if (user && user?.id !== id)
      throw new ConflictException(ConflictMessage.Username);
    else if (user && user?.id === id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    await this.userRepository.update({ id: user.id }, { username });
    return {
      message: PublicMessage.Updated,
    };
  }
  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new BadRequestException(NotFoundMessage.Any);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new BadRequestException(AuthMessage.CodeExpired);
    if (otp.code !== code) throw new BadRequestException(AuthMessage.TryAgain);
    return otp;
  }
  async followToggle(followingId: number) {
    const { id: userId } = this.request.user;
    if (followingId === userId)
      throw new BadRequestException(BadRequestMessage.Invalid_Following);
    const following = await this.userRepository.findOneBy({ id: followingId });
    if (!following) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    const isFollowed = await this.followRepository.findOneBy({
      followerId: userId,
      followingId,
    });
    let message = PublicMessage.Followed;
    if (isFollowed) {
      message = PublicMessage.UnFollowed;
      await this.followRepository.remove(isFollowed);
    } else
      await this.followRepository.insert({ followingId, followerId: userId });

    return {
      message,
    };
  }
  async profile() {
    const { id } = this.request.user;
    return this.userRepository
      .createQueryBuilder(EntityName.User)
      .where({ id })
      .leftJoinAndSelect("user.profile", "profile")
      .loadRelationCountAndMap("user.followers", "user.followers")
      .loadRelationCountAndMap("user.following", "user.following")
      .getOne();
  }
  async getList(paginationDto: PaginationDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);
    const [users, count] = await this.userRepository.findAndCount({
      where: {},
      take: limit,
      skip,
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      users,
    };
  }
  async getFollowersList(paginationDto: PaginationDto) {
    const { id: userId } = this.request.user;
    const { limit, skip, page } = paginationSolver(paginationDto);
    const [followers, count] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: {
        follower: {
          profile: true,
        },
      },
      select: {
        id: true,
        follower: {
          id: true,
          username: true,
          profile: {
            id: true,
            nickname: true,
            bio: true,
            image_profile: true,
            bg_image: true,
          },
        },
      },
      take: limit,
      skip,
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      followers,
    };
  }
  async getFollowingsList(paginationDto: PaginationDto) {
    const { id: userId } = this.request.user;
    const { limit, skip, page } = paginationSolver(paginationDto);
    const [following, count] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: {
        following: {
          profile: true,
        },
      },
      select: {
        id: true,
        following: {
          id: true,
          username: true,
          profile: {
            id: true,
            nickname: true,
            bio: true,
            image_profile: true,
            bg_image: true,
          },
        },
      },
      take: limit,
      skip,
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      following,
    };
  }
  async blockToggle(blockDto: BlockDto) {
    const { userId } = blockDto;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    let message = PublicMessage.Blocked;
    if (user.status === ProfileStatus.Blocked) {
      message = PublicMessage.UnBlocked;
      await this.userRepository.update({ id: userId }, { status: null });
    } else {
      await this.userRepository.update(
        { id: userId },
        { status: ProfileStatus.Blocked }
      );
    }

    return {
      message,
    };
  }
}
