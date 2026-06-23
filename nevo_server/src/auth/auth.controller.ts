import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { VerifyDto, AuthResult } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify')
  verify(@Body() dto: VerifyDto): Promise<AuthResult> {
    return this.authService.verify(dto);
  }
}
