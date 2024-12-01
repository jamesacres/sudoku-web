import { Party, SessionParty, Session } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { PartyInviteButton } from '../PartyInviteButton/PartyInviteButton';
import SimpleSudoku from '../SimpleSudoku';

const PartyRow = ({
  party: { partyName, isOwner, members, partyId },
  puzzleId,
  redirectUri,
  sessionParty,
}: {
  party: Party;
  puzzleId: string;
  redirectUri: string;
  sessionParty?: SessionParty<Session<ServerState>>;
}) => {
  return (
    <li>
      <div>
        <h2 className="mt-8 text-xl">{partyName}</h2>
        {isOwner && (
          <PartyInviteButton
            puzzleId={puzzleId}
            redirectUri={redirectUri}
            partyId={partyId}
            partyName={partyName}
          />
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
                {!isUser && sessionParty?.memberSessions[userId] && (
                  <SimpleSudoku
                    final={sessionParty.memberSessions[userId]!.state.final}
                    initial={sessionParty.memberSessions[userId]!.state.initial}
                    latest={
                      sessionParty.memberSessions[userId]!.state.answerStack[
                        sessionParty.memberSessions[userId]!.state.answerStack
                          .length - 1
                      ]
                    }
                  />
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
