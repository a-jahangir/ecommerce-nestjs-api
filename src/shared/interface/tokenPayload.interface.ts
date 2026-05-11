import { UserRoleEnum } from '../enum/user.role.enum';

interface TokenPayload {
  userId: string;
  role: UserRoleEnum;
  // isSecondFactorAuthenticated?: boolean;
}

export default TokenPayload;
