import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "./../entities/blog.entity";
import { Repository } from "typeorm";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "./../dto/blog.dto";
import { createSlug, randomID } from "src/common/utils/functions";
import { REQUEST } from "@nestjs/core";
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
import { CategoryService } from "../../category/category.service";
import { BlogCategoryEntity } from "./../entities/blog-category.entity";
import { isArray } from "class-validator";
import { EntityName } from "src/common/enums/entity.enum";
import { BlogLikesEntity } from "./../entities/like.entity";
import { BlogBookmarkEntity } from "./../entities/bookmark.entity";
import { BlogCommentService } from "./comment.service";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(BlogLikesEntity)
    private blogLikeRepository: Repository<BlogLikesEntity>,
    @InjectRepository(BlogBookmarkEntity)
    private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService,
    private blogCommentService: BlogCommentService
  ) {}

  async create(blogDto: CreateBlogDto) {
    const user = this.request.user;
    let {
      title,
      slug,
      content,
      description,
      time_for_study,
      image,
      categories,
    } = blogDto;

    if (typeof categories === "string") categories = categories.split(",");
    else if (!isArray(categories))
      throw new BadRequestException(BadRequestMessage.InvalidCategories);

    let slugData = slug ?? title;
    slug = createSlug(slugData);

    const isExist = await this.checkBlogBySlug(slug);
    if (isExist) slug += `-${randomID()}`;

    const blog = this.blogRepository.create({
      title,
      slug,
      content,
      description,
      time_for_study,
      image,
      authorId: user.id,
    });
    await this.blogRepository.save(blog);

    for (const categoryTitle of categories) {
      let category = await this.categoryService.getOneByTitle(categoryTitle);

      if (!category) {
        category = await this.categoryService.insertByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }

    return {
      message: PublicMessage.Created,
    };
  }
  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });
    return blog;
  }
  async myBlog() {
    const user = this.request.user;
    return this.blogRepository.find({
      where: { authorId: user.id },
      order: {
        id: "desc",
      },
    });
  }
  async blogList(paginationDto: PaginationDto, filterDto: FilterBlogDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);
    let { category, search } = filterDto;

    let where = "";

    if (category) {
      category = category.toLowerCase().trim();
      if (where.length > 0) where = " AND ";
      where += "category.title = LOWER(:category)";
    }
    if (search) {
      if (where.length > 0) where = " AND ";
      search = `%${search}%`;
      where +=
        "CONCAT(blog.title, blog.description,blog.content) ILIKE :search";
    }

    const [blogs, count] = await this.blogRepository
      .createQueryBuilder(EntityName.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("blog.author", "author")
      .leftJoin("author.profile", "profile")
      .addSelect([
        "categories.id",
        "category.title",
        "author.username",
        "author.id",
        "profile.nickname",
      ])
      .where(where, { category, search })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
      .loadRelationCountAndMap(
        "blog.comments",
        "blog.comments",
        "comments",
        (qb) => qb.where("comments.accepted = :accepted", { accepted: true })
      )
      .orderBy("blog.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    //! don't Remove for Future
    // const [blogs, count] = await this.blogRepository.findAndCount({
    //   relations: {
    //     categories: {
    //       category: true,
    //     },
    //   },
    //   where,
    //   select: { categories: { id: true, category: { title: true } } },
    //   order: {
    //     id: "desc",
    //   },
    //   skip,
    //   take: limit,
    // });

    return {
      pagination: paginationGenerator(count, page, limit),
      blogs,
    };
  }
  async delete(id: number) {
    await this.findOne(id);
    await this.blogRepository.delete({ id });
    return {
      message: PublicMessage.Deleted,
    };
  }
  async update(id: number, blogDto: UpdateBlogDto) {
    const user = this.request.user;
    let {
      title,
      slug,
      content,
      description,
      time_for_study,
      image,
      categories,
    } = blogDto;

    const blog = await this.findOne(id);

    if (typeof categories === "string") categories = categories.split(",");
    else if (!isArray(categories))
      throw new BadRequestException(BadRequestMessage.InvalidCategories);

    let slugData = null;
    if (title) {
      slugData = title;
      blog.title = title;
    }
    if (slug) slugData = slug;
    if (slugData) {
      slug = createSlug(slugData);
      const isExist = await this.checkBlogBySlug(slug);
      if (isExist && isExist.id !== id) slug += `-${randomID()}`;
      blog.slug = slug;
    }
    if (description) blog.description = description;
    if (content) blog.content = content;
    if (image) blog.image = image;
    if (time_for_study) blog.time_for_study = time_for_study;

    await this.blogRepository.save(blog);

    if (categories && isArray(categories) && categories.length > 0)
      await this.blogCategoryRepository.delete({ blogId: blog.id });

    for (const categoryTitle of categories) {
      let category = await this.categoryService.getOneByTitle(categoryTitle);

      if (!category) {
        category = await this.categoryService.insertByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }

    return {
      message: PublicMessage.Updated,
    };
  }
  async likeBlog(blogId: number) {
    const { id: userId } = this.request.user;
    await this.findOne(blogId);
    let message = PublicMessage.Like;
    const isLiked = await this.blogLikeRepository.findOneBy({ userId, blogId });
    if (isLiked) {
      await this.blogLikeRepository.delete({ id: isLiked.id });
      message = PublicMessage.DisLike;
    } else await this.blogLikeRepository.insert({ userId, blogId });

    return {
      message,
    };
  }
  async bookmarkBlog(blogId: number) {
    const { id: userId } = this.request.user;
    await this.findOne(blogId);
    let message = PublicMessage.Bookmark;
    const isBookmarked = await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId,
    });
    if (isBookmarked) {
      await this.blogBookmarkRepository.delete({ id: isBookmarked.id });
      message = PublicMessage.UnBookmark;
    } else await this.blogBookmarkRepository.insert({ userId, blogId });

    return {
      message,
    };
  }
  async findOne(id: number) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException(NotFoundMessage.Any);
    return blog;
  }
  async findBlogBySlug(slug: string, paginationDto: PaginationDto) {
    const userId = this?.request?.user?.id;
    const blog = await this.blogRepository
      .createQueryBuilder(EntityName.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("blog.author", "author")
      .leftJoin("author.profile", "profile")
      .addSelect([
        "categories.id",
        "category.title",
        "author.username",
        "author.id",
        "profile.nickname",
      ])
      .where({ slug })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
      .getOne();

    if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundPost);

    const comments = await this.blogCommentService.blogCommentList(
      blog.id,
      paginationDto
    );

    const isLiked = !!(await this.blogLikeRepository.findOneBy({
      userId,
      blogId: blog.id,
    }));
    const isBookmarked = !!(await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId: blog.id,
    }));
    return {
      blog,
      isLiked,
      isBookmarked,
      comments,
    };
  }
}
