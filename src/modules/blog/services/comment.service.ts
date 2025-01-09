import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogCommentEntity } from "../entities/comment.entity";
import { IsNull, Repository } from "typeorm";
import { BlogService } from "./blog.service";
import { CreateCommentDto } from "../dto/comment.dto";
import { Request } from "express";
import {
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogCommentEntity)
    private blogCommentRepository: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request: Request,
    @Inject(forwardRef(() => BlogService)) private blogService: BlogService
  ) {}

  async create(commentDto: CreateCommentDto) {
    const { id: userId } = this.request.user;
    const { text, parentId, blogId } = commentDto;
    await this.blogService.findOne(blogId);
    let parent = null;
    if (parentId && !isNaN(parentId)) {
      parent = await this.blogCommentRepository.findOneBy({ id: +parentId });
    }
    await this.blogCommentRepository.insert({
      text,
      accepted: true,
      blogId,
      parentId: parent ? parentId : null,
      userId,
    });

    return {
      message: PublicMessage.CreatedComment,
    };
  }
  async commentList(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      relations: {
        blog: {},
        user: {
          profile: true,
        },
      },
      where: {},
      select: {
        blog: { title: true },
        user: { username: true, profile: { nickname: true } },
      },
      skip,
      take: limit,
      order: { id: "desc" },
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }
  async blogCommentList(blogId: number, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      relations: {
        user: {
          profile: true,
        },
        children: {
          user: {
            profile: true,
          },
          children: {
            user: {
              profile: true,
            },
          },
        },
      },
      where: {
        blogId,
        parentId: IsNull(),
      },
      select: {
        user: { username: true, profile: { nickname: true } },
        children: {
          parentId: true,
          text: true,
          createdAt: true,
          user: { username: true, profile: { nickname: true } },
          children: {
            parentId: true,
            text: true,
            createdAt: true,
            user: { username: true, profile: { nickname: true } },
          },
        },
      },
      skip,
      take: limit,
      order: { id: "desc" },
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async accept(id: number) {
    const comment = await this.findOne(id);
    if (comment.accepted)
      throw new BadRequestException(BadRequestMessage.Already_Accepted);
    comment.accepted = true;
    await this.blogCommentRepository.save(comment);

    return {
      message: PublicMessage.Updated,
    };
  }
  async reject(id: number) {
    const comment = await this.findOne(id);
    if (!comment.accepted)
      throw new BadRequestException(BadRequestMessage.Already_Rejected);
    comment.accepted = false;
    await this.blogCommentRepository.save(comment);

    return {
      message: PublicMessage.Updated,
    };
  }

  async findOne(id: number) {
    const comment = await this.blogCommentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException(NotFoundMessage.Any);
    return comment;
  }
}
