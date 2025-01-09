import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { BlogService } from "./../services/blog.service";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger.consumes.enum";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SkipAuth } from "src/common/decorators/skip-auth.decorator";
import { FilterBlog } from "src/common/decorators/filter.decorator";
import { AuthDecorator } from "src/common/decorators/auth.decorator";

@Controller("blog")
@ApiTags("Blog")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() blogDto: CreateBlogDto) {
    return this.blogService.create(blogDto);
  }

  @Put("/:id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() blogDto: UpdateBlogDto
  ) {
    return this.blogService.update(id, blogDto);
  }

  @Get("/my-blogs")
  myBlogs() {
    return this.blogService.myBlog();
  }

  @Delete("/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }

  @Get("/like/:id")
  likeToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.likeBlog(id);
  }

  @Get("/bookmark/:id")
  bookmarkToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.bookmarkBlog(id);
  }

  @Get("/list")
  @Pagination()
  @SkipAuth()
  @FilterBlog()
  find(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterBlogDto
  ) {
    return this.blogService.blogList(paginationDto, filterDto);
  }

  @Get("/by-slug/:slug")
  @SkipAuth()
  @Pagination()
  findOneBySlug(
    @Param("slug") slug: string,
    @Query() @Query() paginationDto: PaginationDto
  ) {
    return this.blogService.findBlogBySlug(slug, paginationDto);
  }
}
