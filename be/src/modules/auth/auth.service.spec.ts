import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "./auth.service.js";
import { UsersService } from "../users/users.service.js";
import { EmailService } from "../email/email.service.js";
import { PrismaService } from "../../database/prisma.service.js";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { UserRole, UserStatus } from "@prisma/client";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";
import argon2 from "argon2";
import crypto from "crypto";

describe("AuthService", () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockUsersService: any;
  let mockEmailService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  const mockUser = {
    id: "user-uuid-1",
    name: "Nguyen Van A",
    email: "test@example.com",
    passwordHash: "mocked-argon2-hash",
    avatarUrl: null,
    role: UserRole.SELLER,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockSession = {
    id: "session-uuid-1",
    userId: mockUser.id,
    refreshTokenHash: "hashed-refresh-token",
    expiresAt: new Date(Date.now() + 86400000),
    revokedAt: null,
    createdAt: new Date(),
    lastUsedAt: null,
    userAgent: "Mozilla/5.0",
    ipHash: "hash-ip",
    user: mockUser,
  };

  beforeEach(() => {
    mockPrisma = {
      authSession: {
        create: vi.fn().mockResolvedValue(mockSession),
        update: vi.fn().mockResolvedValue(mockSession),
        findUnique: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      passwordResetToken: {
        create: vi.fn().mockResolvedValue({ id: "token-1" }),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: "token-1" }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        update: vi.fn().mockResolvedValue(mockUser),
      },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
    };

    mockUsersService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      updateLastLogin: vi.fn().mockResolvedValue(undefined),
    };

    mockEmailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue("mocked.jwt.token"),
      verifyAsync: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: any) => {
        if (key === "JWT_ACCESS_SECRET") return "access-secret";
        if (key === "JWT_REFRESH_SECRET") return "refresh-secret";
        if (key === "FRONTEND_URL") return "http://localhost:3000";
        return defaultVal;
      }),
    };

    service = new AuthService(
      mockPrisma as unknown as PrismaService,
      mockUsersService as unknown as UsersService,
      mockEmailService as unknown as EmailService,
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe("register", () => {
    it("should register successfully and return user with tokens", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        name: "Nguyen Van A",
        email: "test@example.com",
        password: "Password123!",
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
      expect((result.user as any).passwordHash).toBeUndefined();
      expect(result.tokens.accessToken).toBe("mocked.jwt.token");
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockPrisma.authSession.create).toHaveBeenCalled();
    });

    it("should throw ConflictException if email already exists", async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          name: "Nguyen Van A",
          email: "test@example.com",
          password: "Password123!",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should login successfully and return tokens", async () => {
      const hashedPassword = await argon2.hash("Password123!", { type: argon2.argon2id });
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
      });

      const result = await service.login({
        email: "test@example.com",
        password: "Password123!",
      });

      expect(result.tokens.accessToken).toBe("mocked.jwt.token");
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(mockPrisma.authSession.create).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: "nonexistent@example.com",
          password: "Password123!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password does not match", async () => {
      const hashedPassword = await argon2.hash("CorrectPassword1!", { type: argon2.argon2id });
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
      });

      await expect(
        service.login({
          email: "test@example.com",
          password: "WrongPassword!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if user has no passwordHash", async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: null,
      });

      await expect(
        service.login({
          email: "test@example.com",
          password: "Password123!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if user is blocked", async () => {
      const hashedPassword = await argon2.hash("Password123!", { type: argon2.argon2id });
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
        status: UserStatus.BLOCKED,
      });

      await expect(
        service.login({
          email: "test@example.com",
          password: "Password123!",
        }),
      ).rejects.toThrow(new UnauthorizedException(ERROR_CODES.ACCOUNT_BLOCKED));
    });

    it("should set 30d session duration when rememberMe is true", async () => {
      const hashedPassword = await argon2.hash("Password123!", { type: argon2.argon2id });
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
      });

      const result = await service.login({
        email: "test@example.com",
        password: "Password123!",
        rememberMe: true,
      });

      expect(result.tokens.refreshExpiresIn).toBe(30 * 24 * 60 * 60);
    });
  });

  describe("refreshToken", () => {
    it("should rotate refresh token successfully", async () => {
      const rawToken = "raw-refresh-token-123";
      const hashed = await argon2.hash(rawToken, { type: argon2.argon2id });

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        sessionId: mockSession.id,
      });

      mockPrisma.authSession.findUnique.mockResolvedValue({
        ...mockSession,
        refreshTokenHash: hashed,
      });

      const tokens = await service.refreshToken(rawToken);

      expect(tokens.accessToken).toBe("mocked.jwt.token");
      expect(mockPrisma.authSession.update).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if jwt verify fails", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("jwt expired"));

      await expect(service.refreshToken("expired-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if session not found", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        sessionId: "invalid-session",
      });
      mockPrisma.authSession.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken("valid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if session is revoked", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        sessionId: mockSession.id,
      });
      mockPrisma.authSession.findUnique.mockResolvedValue({
        ...mockSession,
        revokedAt: new Date(),
      });

      await expect(service.refreshToken("token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if session is expired", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        sessionId: mockSession.id,
      });
      mockPrisma.authSession.findUnique.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refreshToken("token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should revoke session and throw UnauthorizedException if refresh token hash does not match", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        sessionId: mockSession.id,
      });
      const differentHash = await argon2.hash("different-token", { type: argon2.argon2id });
      mockPrisma.authSession.findUnique.mockResolvedValue({
        ...mockSession,
        refreshTokenHash: differentHash,
      });

      await expect(service.refreshToken("stolen-token")).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrisma.authSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockSession.id },
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });

    it("should throw UnauthorizedException if session user is blocked", async () => {
      const rawToken = "raw-refresh-token-123";
      const hashed = await argon2.hash(rawToken, { type: argon2.argon2id });

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        sessionId: mockSession.id,
      });
      mockPrisma.authSession.findUnique.mockResolvedValue({
        ...mockSession,
        refreshTokenHash: hashed,
        user: { ...mockUser, status: UserStatus.BLOCKED },
      });

      await expect(service.refreshToken(rawToken)).rejects.toThrow(
        new UnauthorizedException(ERROR_CODES.ACCOUNT_BLOCKED),
      );
    });
  });

  describe("logout", () => {
    it("should revoke session if sessionId is provided", async () => {
      const res = await service.logout("session-123");
      expect(res.success).toBe(true);
      expect(mockPrisma.authSession.updateMany).toHaveBeenCalledWith({
        where: { id: "session-123", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it("should return success even without sessionId", async () => {
      const res = await service.logout();
      expect(res.success).toBe(true);
    });
  });

  describe("forgotPassword", () => {
    it("should generate token and send email if user exists", async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const res = await service.forgotPassword({ email: "test@example.com" });

      expect(res.success).toBe(true);
      expect(mockPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it("should return success without error if user does not exist", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const res = await service.forgotPassword({ email: "notfound@example.com" });

      expect(res.success).toBe(true);
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    const rawToken = "valid-reset-token-hex";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    it("should reset password and revoke all sessions", async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "reset-id",
        userId: mockUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      });

      const res = await service.resetPassword({
        token: rawToken,
        newPassword: "NewStrongPassword123!",
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("should throw BadRequestException if token is invalid", async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: "invalid-token",
          newPassword: "NewPassword123!",
        }),
      ).rejects.toThrow(new BadRequestException(ERROR_CODES.INVALID_RESET_TOKEN));
    });

    it("should throw BadRequestException if token is already used", async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "reset-id",
        userId: mockUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(),
      });

      await expect(
        service.resetPassword({
          token: rawToken,
          newPassword: "NewPassword123!",
        }),
      ).rejects.toThrow(new BadRequestException(ERROR_CODES.RESET_TOKEN_USED));
    });

    it("should throw BadRequestException if token is expired", async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "reset-id",
        userId: mockUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
      });

      await expect(
        service.resetPassword({
          token: rawToken,
          newPassword: "NewPassword123!",
        }),
      ).rejects.toThrow(new BadRequestException(ERROR_CODES.RESET_TOKEN_EXPIRED));
    });
  });

  describe("getMe", () => {
    it("should return sanitized user profile", async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const user = await service.getMe(mockUser.id);
      expect(user.id).toBe(mockUser.id);
      expect((user as any).passwordHash).toBeUndefined();
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.getMe("unknown-id")).rejects.toThrow(
        new UnauthorizedException(ERROR_CODES.USER_NOT_FOUND),
      );
    });
  });
});
