import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ example: "raw_token_string" })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: "NewP@ssword123" })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword!: string;
}
