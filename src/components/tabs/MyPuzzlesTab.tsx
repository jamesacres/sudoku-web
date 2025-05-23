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
      <h1 className="mb-2 text-4xl font-extrabold">My Puzzles</h1>
      {!!inProgress?.length && (
        <div className="mb-4">
          <h2 className="mb-2 text-2xl font-extrabold">In Progress</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
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
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
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
