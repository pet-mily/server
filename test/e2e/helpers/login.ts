import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const login = async (app: INestApplication) => {
  const signupDto = {
    provider: 'KAKAO',
    providerAccessToken: 'test-oauth-token',
  };

  const { body } = await request(app.getHttpServer())
    .post('/auth/signup')
    .send(signupDto);

  return {
    accessToken: body.accessToken,
  };
};
