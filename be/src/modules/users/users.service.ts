import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import { User, UserRole, UserStatus } from "@prisma/client";

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  status?: UserStatus;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? UserRole.SELLER,
        status: data.status ?? UserStatus.ACTIVE,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
