import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "P@ssword123" })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
