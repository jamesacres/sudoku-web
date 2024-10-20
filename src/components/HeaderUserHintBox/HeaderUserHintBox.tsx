'use client';
import { HintBox } from '@/components/HintBox/HintBox';
import { UserContext } from '@/providers/UserProvider';
import { useContext } from 'react';

const HeaderUserHintBox = () => {
  const { user, isLoggingIn } = useContext(UserContext) || {};
  return (
    <>
      {!user && !isLoggingIn && (
        <HintBox>
          Signing in enables you to switch devices, and avoid losing your
          puzzles!
        </HintBox>
      )}
    </>
  );
};

export default HeaderUserHintBox;
