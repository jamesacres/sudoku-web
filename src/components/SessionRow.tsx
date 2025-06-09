'use client';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage';
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

  // Calculate completion percentages
  const myPercentage = mySession
    ? calculateCompletionPercentage(
        mySession.state.initial,
        mySession.state.final,
        mySession.state.answerStack[mySession.state.answerStack.length - 1]
      )
    : 0;

  const friendPercentage = memberSession
    ? calculateCompletionPercentage(
        memberSession.state.initial,
        memberSession.state.final,
        memberSession.state.answerStack[
          memberSession.state.answerStack.length - 1
        ]
      )
    : 0;

  return (
    <li
      key={session.sessionId}
      className="rounded-sm border-2 border-stone-200 bg-stone-50/80 hover:bg-stone-100 disabled:bg-stone-300 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:disabled:bg-zinc-300"
    >
      <Link href={`/puzzle?initial=${initial}&final=${final}`}>
        <SimpleSudoku
          initial={puzzleTextToPuzzle(initial)}
          final={puzzleTextToPuzzle(final)}
          latest={latest}
        />
        <div className="mr-2 inline-block w-full px-4 py-2 text-center text-gray-900 dark:text-white">
          <p>
            {(mySession?.state.answerStack.length || 0) > 1
              ? mySession?.state.completed
                ? 'You Completed!'
                : 'Continue Game'
              : 'Start Game'}
          </p>
          {
            <div className="mt-1 mb-2">
              <div className="flex items-center justify-center">
                <div className="h-2 w-3/4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${myPercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {myPercentage}%
                </span>
              </div>
            </div>
          }
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
          {memberSession && (
            <div className="mt-1 mb-2">
              <div className="flex items-center justify-center">
                <div className="h-2 w-3/4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${friendPercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {friendPercentage}%
                </span>
              </div>
            </div>
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
