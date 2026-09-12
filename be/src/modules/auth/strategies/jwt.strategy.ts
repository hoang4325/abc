import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { UsersService } from "../../users/users.service.js";
import { ERROR_CODES } from "../../../common/constants/error-codes.constant.js";
import { UserStatus } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token: string | null = null;
          if (req && req.cookies) {
            token = req.cookies["access_token"] || null;
          }
          if (!token && req && req.headers.authorization) {
            const parts = req.headers.authorization.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
              token = parts[1];
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET") || "sharedeal-jwt-access-secret-default-key",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(ERROR_CODES.USER_NOT_FOUND);
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException(ERROR_CODES.ACCOUNT_BLOCKED);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      sessionId: payload.sessionId,
    };
  }
}
