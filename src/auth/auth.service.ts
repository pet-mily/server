import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}
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
    } else {
      profile = await this.getNaverProfile(providerAccessToken);
    }

    const user = await this.userRepository.findUserByProvider(
      provider,
      profile.id,
    );
  }

  async signup({
    provider,
    providerAccessToken,
  }: {
    provider: 'KAKAO' | 'NAVER';
    providerAccessToken: string;
  }) {
    let profile;
    if (provider === 'KAKAO') {
      profile = await this.getKakaoProfile(providerAccessToken);
    } else {
      profile = await this.getNaverProfile(providerAccessToken);
    }

    const user = await this.userRepository.createUser(provider, profile.id);
    const accessToken = await this.createAccessToken(user.id);

    return {
      accessToken,
    };
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

  async createAccessToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }
}
