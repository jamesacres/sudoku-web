import { UserProfile } from '@/types/userProfile';
import Image from 'next/image';
import { User } from 'react-feather';

export const UserAvatar = ({
  user,
  size,
}: {
  user: UserProfile;
  size: number;
}) =>
  user.picture ? (
    <Image
      src={user.picture}
      alt={user.name || 'user'}
      width={size}
      height={size}
      className="rounded-full"
    />
  ) : (
    <User className="text-white" style={{ height: size, width: size }} />
  );
