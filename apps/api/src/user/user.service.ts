import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository.js';
import { CreateUserType } from './user.schema.js';
import { Prisma } from '../generated/prisma/client.js';
import { PasswordHasher } from '@nestjs/authentication';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async createUser(data: CreateUserType) {
    if (await this.userRepository.findByEmail(data.email)) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.passwordHasher.hash(data.password);
    const createData: Prisma.UserCreateInput = {
      email: this.normalize(data.email),
      passwordHash,
      name: data.name,
      role: data.role ?? undefined,
    };
    return this.userRepository.create(createData);
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return user;
  }

  async findCredentials(email: string) {
    const user = await this.userRepository.findCredentials(
      this.normalize(email),
    );
    return user ?? null;
  }

  async updatePassword(id: string, password: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const passwordHash = await this.passwordHasher.hash(password);
    await this.userRepository.updatePasswordHash(id, passwordHash);
  }

  async markEmailVerified(id: string, email: string) {
    const user = await this.userRepository.findById(id);
    if (!user || user.email !== this.normalize(email)) {
      return false;
    }
    return !!(await this.userRepository.markEmailVerified(
      id,
      this.normalize(email),
    ));
  }

  private normalize(email: string): string {
    return email.trim().normalize('NFC').toLowerCase();
  }
}
