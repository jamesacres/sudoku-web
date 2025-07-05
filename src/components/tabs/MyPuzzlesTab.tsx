'use client';
import { ServerStateResult } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import SessionRow from '../SessionRow';

interface MyPuzzlesTabProps {
  sessions?: ServerStateResult<ServerState>[];
}

export const MyPuzzlesTab = ({ sessions }: MyPuzzlesTabProps) => {
  const inProgress = sessions?.filter((session) => !session.state.completed);
  const completed = sessions?.filter((session) => session.state.completed);

  return (
    <div className="mb-4">
      <h1 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-4xl font-bold text-transparent">
        My Puzzles
      </h1>
      <p className="my-4">
        This page lists puzzles you have played in the past 30 days.
      </p>
      {!!inProgress?.length && (
        <div className="mb-4">
          <h2 className="mb-2 text-2xl font-extrabold">In Progress</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {inProgress?.map((session) => (
              <SessionRow
                key={session.sessionId}
                mySession={session}
                display="my"
              />
            ))}
          </ul>
        </div>
      )}
      {!!completed?.length && (
        <div className="mb-4">
          <h2 className="mb-2 text-2xl font-extrabold">Completed</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {completed?.map((session) => (
              <SessionRow
                key={session.sessionId}
                mySession={session}
                display="my"
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyPuzzlesTab;
