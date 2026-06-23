import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOrCreate(publicKey: string): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { publicKey } });
    if (existing) return existing;

    return this.userRepo.save(
      this.userRepo.create({ publicKey, username: null }),
    );
  }
}
