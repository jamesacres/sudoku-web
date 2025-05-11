'use client';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import {
  puzzleTextToPuzzle,
  puzzleToPuzzleText,
} from '@/helpers/puzzleTextToPuzzle';
import { ServerStateResult } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import Link from 'next/link';
import { TimerDisplay } from './TimerDisplay/TimerDisplay';
import SimpleSudoku from './SimpleSudoku';

interface SessionRowProps {
  mySession?: ServerStateResult<ServerState>;
  memberSession?: ServerStateResult<ServerState>;
  display: 'my' | 'user';
  memberNickname?: string;
}

export const SessionRow = ({
  mySession,
  memberSession,
  display,
  memberNickname,
}: SessionRowProps) => {
  const session = mySession || memberSession;
  if (!session) {
    return null;
  }
  const initial = puzzleToPuzzleText(session.state.initial);
  const final = puzzleToPuzzleText(session.state.final);

  // Session may be from a friend, display userSession when provided
  const displaySession = display === 'my' ? mySession : memberSession;

  const latest =
    displaySession?.state.answerStack[
      displaySession?.state.answerStack.length - 1
    ];
  return (
    <li
      key={session.sessionId}
      className="rounded-sm border-2 border-zinc-600 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-300"
    >
      <Link href={`/puzzle?initial=${initial}&final=${final}`}>
        <SimpleSudoku
          initial={puzzleTextToPuzzle(initial)}
          final={puzzleTextToPuzzle(final)}
          latest={latest}
        />
        <div className="mr-2 inline-block w-full px-4 py-2 text-center text-white">
          <p>
            {(mySession?.state.answerStack.length || 0) > 1
              ? mySession?.state.completed
                ? 'You Completed!'
                : 'Continue Game'
              : 'Start Game'}
          </p>
          {memberSession && mySession?.state.timer !== undefined && 'Your time'}
          {mySession?.state.timer !== undefined && (
            <TimerDisplay seconds={calculateSeconds(mySession.state.timer)} />
          )}
          {memberNickname ? (
            <p>
              {(memberSession?.state.answerStack.length || 0) > 1
                ? memberSession?.state.completed
                  ? `${memberNickname} Completed!`
                  : `${memberNickname} in progress`
                : `${memberNickname} not started`}
            </p>
          ) : (
            <></>
          )}
          {memberSession?.state.timer !== undefined && (
            <TimerDisplay
              seconds={calculateSeconds(memberSession.state.timer)}
            />
          )}
        </div>
      </Link>
    </li>
  );
};

export default SessionRow;
