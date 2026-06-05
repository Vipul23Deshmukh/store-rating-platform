import { Role } from '../../../common/constants/roles.enum';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
