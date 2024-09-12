import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/repositories/user.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    const accessToken = await this.createAccessToken(user.id);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
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
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getKakaoProfile(providerAccessToken: string) {
    const result = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${providerAccessToken}`,
      },
    });
    const data = await result.json();

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

  async createRefreshToken(userId: string) {
    const refreshToken = this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    await this.userRepository.saveRefreshToken(userId, refreshToken);
    return refreshToken;
  }
}
