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
          Signing in enables you to play sudoku of the day, play with friends,
          and switch devices with cloud storage for 30 days.
        </HintBox>
      )}
    </>
  );
};

export default HeaderUserHintBox;
