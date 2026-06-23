import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

export interface VerifyDto {
  publicKey: string;
  signature: string;
  message: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async verify(dto: VerifyDto): Promise<AuthResult> {
    // TODO: replace with real Stellar Ed25519 signature verification (#11)
    if (!this.verifySignature())
      throw new UnauthorizedException('Invalid signature');

    const user = await this.usersService.findOrCreate(dto.publicKey);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      publicKey: user.publicKey,
    });

    return { accessToken, user };
  }

  private verifySignature(): boolean {
    // TODO: replace with real Stellar Ed25519 signature verification (#11)
    return true;
  }
}
