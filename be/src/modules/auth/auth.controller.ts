import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";
import { ConfigService } from "@nestjs/config";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessExpiresIn: number,
    refreshExpiresIn: number,
  ) {
    const cookieSecureConfig = this.configService.get<string>("COOKIE_SECURE");
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";
    const secure =
      cookieSecureConfig !== undefined
        ? cookieSecureConfig === "true"
        : isProduction;

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: accessExpiresIn * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: refreshExpiresIn * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
  }

  private extractClientMeta(req: Request) {
    const userAgent = req.headers["user-agent"] as string | undefined;
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;
    return { userAgent, ip };
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Đăng ký tài khoản người dùng" })
  @ApiResponse({ status: 201, description: "Đăng ký thành công" })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = this.extractClientMeta(req);
    const result = await this.authService.register(dto, meta);
    this.setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken,
      result.tokens.accessExpiresIn,
      result.tokens.refreshExpiresIn,
    );
    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đăng nhập tài khoản" })
  @ApiResponse({ status: 200, description: "Đăng nhập thành công" })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = this.extractClientMeta(req);
    const result = await this.authService.login(dto, meta);
    this.setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken,
      result.tokens.accessExpiresIn,
      result.tokens.refreshExpiresIn,
    );
    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Làm mới access token và xoay vòng refresh token" })
  @ApiResponse({ status: 200, description: "Làm mới token thành công" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body("refreshToken") bodyRefreshToken?: string,
  ) {
    const rawRefreshToken = req.cookies?.refresh_token || bodyRefreshToken;
    if (!rawRefreshToken) {
      throw new UnauthorizedException("REFRESH_TOKEN_REQUIRED");
    }

    const meta = this.extractClientMeta(req);
    const tokens = await this.authService.refreshToken(rawRefreshToken, meta);

    this.setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.accessExpiresIn,
      tokens.refreshExpiresIn,
    );

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đăng xuất tài khoản và hủy phiên làm việc" })
  @ApiResponse({ status: 200, description: "Đăng xuất thành công" })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user;
    await this.authService.logout(user?.sessionId);
    this.clearAuthCookies(res);
    return { success: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lấy thông tin người dùng hiện tại" })
  @ApiResponse({ status: 200, description: "Thông tin người dùng hiện tại" })
  async me(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Yêu cầu liên kết đặt lại mật khẩu" })
  @ApiResponse({ status: 200, description: "Đã tiếp nhận yêu cầu" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đặt lại mật khẩu với token" })
  @ApiResponse({ status: 200, description: "Đặt lại mật khẩu thành công" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
