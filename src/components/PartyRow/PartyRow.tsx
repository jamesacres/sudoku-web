import { Party, SessionParty, Session } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { PartyInviteButton } from '../PartyInviteButton/PartyInviteButton';

const PartyRow = ({
  party: { partyName, isOwner, members, partyId },
  puzzleId,
  sessionParty,
}: {
  party: Party;
  puzzleId: string;
  sessionParty?: SessionParty<Session<ServerState>>;
}) => {
  return (
    <li>
      <div>
        <h2 className="mt-8 text-xl">{partyName}</h2>
        {isOwner && <PartyInviteButton puzzleId={puzzleId} partyId={partyId} />}
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
