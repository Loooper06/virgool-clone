import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Otp)
export class OtpEntity extends BaseEntity {
  @Column()
  code: string;
  @Column()
  expiresIn: Date;
  @Column()
  userId: number;
  @OneToOne(() => UserEntity, (user) => user.otp, { onDelete: "CASCADE" })
  user: UserEntity;
}
