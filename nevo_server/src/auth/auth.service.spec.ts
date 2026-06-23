import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService, VerifyDto } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  const user: User = {
    id: 'uuid-1',
    publicKey: 'GABC123',
    username: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const dto: VerifyDto = {
    publicKey: 'GABC123',
    signature: 'sig',
    message: 'msg',
  };

  let service: AuthService;
  const findOrCreate = jest.fn().mockResolvedValue(user);
  const sign = jest.fn().mockReturnValue('jwt-token');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { findOrCreate } },
        { provide: JwtService, useValue: { sign } },
      ],
    }).compile();
    service = module.get(AuthService);
    findOrCreate.mockClear();
    sign.mockClear();
  });

  it('returns accessToken and user on valid input', async () => {
    const result = await service.verify(dto);

    expect(findOrCreate).toHaveBeenCalledWith(dto.publicKey);
    expect(sign).toHaveBeenCalledWith({
      sub: user.id,
      publicKey: user.publicKey,
    });
    expect(result).toEqual({ accessToken: 'jwt-token', user });
  });

  it('calls findOrCreate ensuring user provisioning on first auth', async () => {
    await service.verify(dto);
    expect(findOrCreate).toHaveBeenCalledTimes(1);
  });
});
