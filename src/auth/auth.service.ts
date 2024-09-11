import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login({
    provider,
    providerAccessToken,
  }: {
    provider: 'KAKAO' | 'NAVER';
    providerAccessToken: string;
  }) {
    let profile;
    if (provider === 'KAKAO') {
      profile = await this.getKakaoProfile(providerAccessToken);
      console.log(profile);
    } else {
      profile = await this.getNaverProfile(providerAccessToken);
      console.log(profile);
    }
  }

  async getKakaoProfile(providerAccessToken: string) {
    const result = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${providerAccessToken}`,
      },
    });
    const data = await result.json();
    console.log(data);

    return {
      id: String(data.id),
    } as { id: string };
  }

  async getNaverProfile(providerAccessToken: string) {
    const result = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${providerAccessToken}`,
      },
    });

    const data = await result.json();
    return {
      id: data.response.id,
    } as { id: string };
  }
}
