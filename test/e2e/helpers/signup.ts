import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const signup = async (app: INestApplication) => {
  const signupDto = {
    provider: 'KAKAO',
    providerAccessToken: 'test-oauth-token',
    name: 'test-name',
    phoneNumber: '01012345678',
  };

  const { body } = await request(app.getHttpServer())
    .post('/auth/signup')
    .send(signupDto);

  return {
    accessToken: body.accessToken,
  };
};
