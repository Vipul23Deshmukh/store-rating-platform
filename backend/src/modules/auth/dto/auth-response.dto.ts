import { Role } from '../../../common/constants/roles.enum';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}
