'use client';
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
      className="overflow-hidden rounded-full"
    />
  ) : (
    <div className="flex items-center justify-center rounded-full bg-blue-600" style={{ height: size, width: size }}>
      <User className="text-white" style={{ height: size * 0.6, width: size * 0.6 }} />
    </div>
  );