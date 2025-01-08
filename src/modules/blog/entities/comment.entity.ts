import { IsString, Length } from "class-validator";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.BlogComments)
export class BlogCommentEntity extends BaseEntity {
  @Column()
  blogId: number;
  @Column()
  userId: number;
  @Column()
  @IsString()
  @Length(5, 300, { message: "حداقل 5 کاراکتر و حداکثر 300 کاراکتر باشد" })
  text: string;
  @Column({ default: true })
  accepted: boolean;

  @Column()
  parentId: number;

  @ManyToOne(() => UserEntity, (user) => user.blog_comments, {
    onDelete: "CASCADE",
  })
  user: UserEntity;

  @ManyToOne(() => BlogEntity, (blog) => blog.comments, {
    onDelete: "CASCADE",
  })
  blog: BlogEntity;

  @ManyToOne(() => BlogCommentEntity, (parent) => parent.children, {
    onDelete: "CASCADE",
  })
  parent: BlogCommentEntity;

  @OneToMany(() => BlogCommentEntity, (comment) => comment.parent)
  children: BlogCommentEntity[];
  @JoinColumn({ name: "parent" })
  
  @CreateDateColumn()
  createdAt: Date;
  @CreateDateColumn()
  updatedAt: Date;
}
