import { Inject, Injectable, Scope } from "@nestjs/common";
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
import { PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request
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
}
