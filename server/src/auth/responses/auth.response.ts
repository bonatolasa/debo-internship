export class AuthResponseDto {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
      team?: string;
    };
    accessToken: string;
  };
  message: string;
}
