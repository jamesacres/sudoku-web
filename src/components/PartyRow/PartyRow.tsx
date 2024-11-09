import {
  PartyResult,
  SessionParty,
  SessionResult,
} from '@/hooks/serverStorage';
import { ServerState } from '@/types/state';
import { UserPlus } from 'react-feather';

const PartyRow = ({
  party: { partyName, isOwner, members },
  sessionParty,
}: {
  party: PartyResult;
  sessionParty?: SessionParty<SessionResult<ServerState>>;
}) => {
  return (
    <li>
      <div>
        <h2 className="mt-8 text-xl">{partyName}</h2>
        {isOwner && (
          <button className="mt-2 w-full rounded-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300">
            <UserPlus className="float-left mr-2" /> Invite to Party
          </button>
        )}
        <ul>
          {members.map(({ memberNickname, userId, isOwner, isUser }) => {
            return (
              <li key={userId} className="mt-2">
                {memberNickname}
                {isOwner && ' (owner)'}
                {isUser && ' (you)'}
                {!isUser && !sessionParty?.memberSessions[userId] && (
                  <p>Not started! Ask them to play</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
};

export { PartyRow };
