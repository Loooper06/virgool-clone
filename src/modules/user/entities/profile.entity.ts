import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity } from "typeorm";

@Entity(EntityName.Profile)
export class ProfileEntity extends BaseEntity {
  @Column()
  nickname: string;
  @Column({ nullable: true })
  bio: string;
  @Column({ nullable: true })
  image_profile: string;
  @Column({ nullable: true })
  bg_image: string;
  @Column({ nullable: true })
  birthdate: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ nullable: true })
  linkedIn_link: string;
  @Column({ nullable: true })
  x_link: string;
}
