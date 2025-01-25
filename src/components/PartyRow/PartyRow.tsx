import { Party, SessionParty, Session } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { PartyInviteButton } from '../PartyInviteButton/PartyInviteButton';
import SimpleSudoku from '../SimpleSudoku';
import { TimerDisplay } from '../TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';

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
      <div className="my-8 rounded-lg bg-zinc-700 p-2 text-white">
        <h2 className="text-2xl font-bold">{partyName}</h2>
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
              <li key={userId} className="mt-2 text-lg">
                {isOwner ? '👑  ' : '🧍  '}
                {memberNickname}
                {isUser && ' (you)'}
                {!isUser && !sessionParty?.memberSessions[userId] && (
                  <p>Not started! Ask them to play</p>
                )}
                {sessionParty?.memberSessions[userId]?.state.timer && (
                  <TimerDisplay
                    seconds={calculateSeconds(
                      sessionParty?.memberSessions[userId]?.state.timer
                    )}
                    isComplete={
                      !!sessionParty?.memberSessions[userId]?.state.completed
                    }
                  />
                )}
                {!isUser && sessionParty?.memberSessions[userId] && (
                  <div className="mt-2">
                    <SimpleSudoku
                      final={sessionParty.memberSessions[userId]!.state.final}
                      initial={
                        sessionParty.memberSessions[userId]!.state.initial
                      }
                      latest={
                        sessionParty.memberSessions[userId]!.state.answerStack[
                          sessionParty.memberSessions[userId]!.state.answerStack
                            .length - 1
                        ]
                      }
                    />
                  </div>
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
