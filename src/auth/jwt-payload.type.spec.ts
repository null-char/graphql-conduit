import { JwtPayload } from '@/auth/jwt-payload.type';

describe('JwtPayload', () => {
  it('is defined', () => {
    const jwtPayload = new JwtPayload();
    expect(jwtPayload).toBeDefined();
  });
});
