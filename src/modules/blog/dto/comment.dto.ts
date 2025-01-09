import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, Length } from "class-validator";

export class CreateCommentDto {
  @ApiProperty()
  @IsNumberString()
  blogId: number;
  @ApiProperty()
  @Length(5)
  text: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  parentId: number;
}
