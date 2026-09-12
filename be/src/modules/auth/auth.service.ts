import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import argon2 from "argon2";
import crypto from "crypto";
import { PrismaService } from "../../database/prisma.service.js";
import { UsersService } from "../users/users.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";
import { User, UserStatus } from "@prisma/client";

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthResult {
  user: Omit<User, "passwordHash">;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private sanitizeUser(user: User): Omit<User, "passwordHash"> {
    const { passwordHash: _, ...sanitized } = user;
    return sanitized;
  }

  private hashIp(ip?: string): string | undefined {
    if (!ip) return undefined;
    return crypto.createHash("sha256").update(ip).digest("hex");
  }

  private async generateTokens(
    user: User,
    sessionId: string,
    rememberMe = false,
  ): Promise<AuthTokens> {
    const accessSecret =
      this.configService.get<string>("JWT_ACCESS_SECRET") ||
      "sharedeal-jwt-access-secret-default-key";
    const refreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ||
      "sharedeal-jwt-refresh-secret-default-key";

    const accessExpiresIn = 15 * 60;
    const refreshExpiresIn = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      accessExpiresIn,
      refreshExpiresIn,
    };
  }

  async register(dto: RegisterDto, meta?: SessionMeta): Promise<AuthResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.usersService.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException(ERROR_CODES.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const tempToken = crypto.randomBytes(32).toString("hex");
    const initialRefreshHash = await argon2.hash(tempToken, {
      type: argon2.argon2id,
    });

    const refreshExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: initialRefreshHash,
        expiresAt: refreshExpiresAt,
        userAgent: meta?.userAgent,
        ipHash: this.hashIp(meta?.ip),
      },
    });

    const tokens = await this.generateTokens(user, session.id, false);
    const updatedRefreshHash = await argon2.hash(tokens.refreshToken, {
      type: argon2.argon2id,
    });

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: updatedRefreshHash,
        lastUsedAt: new Date(),
      },
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(dto: LoginDto, meta?: SessionMeta): Promise<AuthResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException(ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException(ERROR_CODES.ACCOUNT_BLOCKED);
    }

    await this.usersService.updateLastLogin(user.id);

    const rememberMe = Boolean(dto.rememberMe);
    const refreshDurationMs = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + refreshDurationMs);

    const tempToken = crypto.randomBytes(32).toString("hex");
    const initialRefreshHash = await argon2.hash(tempToken, {
      type: argon2.argon2id,
    });

    const session = await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: initialRefreshHash,
        expiresAt,
        userAgent: meta?.userAgent,
        ipHash: this.hashIp(meta?.ip),
      },
    });

    const tokens = await this.generateTokens(user, session.id, rememberMe);
    const updatedRefreshHash = await argon2.hash(tokens.refreshToken, {
      type: argon2.argon2id,
    });

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: updatedRefreshHash,
        lastUsedAt: new Date(),
      },
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(
    rawRefreshToken: string,
    meta?: SessionMeta,
  ): Promise<AuthTokens> {
    const refreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ||
      "sharedeal-jwt-refresh-secret-default-key";

    let payload: { sub: string; sessionId: string };
    try {
      payload = await this.jwtService.verifyAsync(rawRefreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException(ERROR_CODES.SESSION_EXPIRED);
    }

    const session = await this.prisma.authSession.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(ERROR_CODES.SESSION_EXPIRED);
    }

    const isValidToken = await argon2.verify(
      session.refreshTokenHash,
      rawRefreshToken,
    );

    if (!isValidToken) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(ERROR_CODES.SESSION_EXPIRED);
    }

    if (session.user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException(ERROR_CODES.ACCOUNT_BLOCKED);
    }

    const isRemembered =
      session.expiresAt.getTime() - session.createdAt.getTime() >
      2 * 24 * 60 * 60 * 1000;

    const tokens = await this.generateTokens(
      session.user,
      session.id,
      isRemembered,
    );
    const newRefreshHash = await argon2.hash(tokens.refreshToken, {
      type: argon2.argon2id,
    });

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newRefreshHash,
        lastUsedAt: new Date(),
        userAgent: meta?.userAgent ?? session.userAgent,
        ipHash: this.hashIp(meta?.ip) ?? session.ipHash,
      },
    });

    return tokens;
  }

  async logout(sessionId?: string): Promise<{ success: boolean }> {
    if (sessionId) {
      await this.prisma.authSession.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true };
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<{ success: boolean; message: string; resetToken?: string; resetUrl?: string }> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const frontendUrl =
        this.configService.get<string>("FRONTEND_URL") ||
        "http://localhost:3000";
      const resetUrl = `${frontendUrl}/auth/auth2/reset-password?token=${rawToken}`;

      return {
        success: true,
        message: "Yêu cầu đặt lại mật khẩu đã được tạo thành công.",
        resetToken: rawToken,
        resetUrl,
      };
    }

    return {
      success: true,
      message: "Nếu email tồn tại trong hệ thống, bạn có thể đặt lại mật khẩu.",
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const tokenHash = crypto
      .createHash("sha256")
      .update(dto.token)
      .digest("hex");

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord) {
      throw new BadRequestException(ERROR_CODES.INVALID_RESET_TOKEN);
    }

    if (resetRecord.usedAt !== null) {
      throw new BadRequestException(ERROR_CODES.RESET_TOKEN_USED);
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestException(ERROR_CODES.RESET_TOKEN_EXPIRED);
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.authSession.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      success: true,
      message: "Mật khẩu đã được đặt lại thành công.",
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(ERROR_CODES.USER_NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }
}
