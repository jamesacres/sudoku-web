import { Party, SessionParty, Session } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { PartyInviteButton } from '../PartyInviteButton/PartyInviteButton';
import SimpleSudoku from '../SimpleSudoku';
import { TimerDisplay } from '../TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage';
import { getPlayerColor, getAllUserIds } from '@/utils/playerColors';
import { useParties } from '@/hooks/useParties';
import { useContext } from 'react';
import { UserContext } from '@/providers/UserProvider';
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
  const { parties } = useParties();
  const { user } = useContext(UserContext) || {};

  // Get consistent ordering of all user IDs for color assignment
  const allUserIds = getAllUserIds(parties);

  return (
    <li>
      <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-zinc-800/80">
        <h3 className="text-theme-primary dark:text-theme-primary-light text-xl font-semibold">
          {partyName}
        </h3>

        {isOwner && (
          <div className="mt-2">
            <PartyInviteButton
              puzzleId={puzzleId}
              redirectUri={redirectUri}
              partyId={partyId}
              partyName={partyName}
            />
          </div>
        )}

        <ul className="mt-4 space-y-4">
          {members.map(({ memberNickname, userId, isOwner, isUser }) => {
            // Calculate completion percentage if session data exists
            const memberSession = sessionParty?.memberSessions[userId];
            const completionPercentage = memberSession
              ? calculateCompletionPercentage(
                  memberSession.state.initial,
                  memberSession.state.final,
                  memberSession.state.answerStack[
                    memberSession.state.answerStack.length - 1
                  ]
                )
              : 0;

            // Get the player color for consistency with RaceTrack
            const playerColor = getPlayerColor(
              userId,
              allUserIds,
              userId === user?.sub
            );

            return (
              <li
                key={userId}
                className="rounded-xl bg-gray-50 p-3 dark:bg-zinc-700/40"
              >
                <div className="flex items-center">
                  <div
                    className={`mr-2 h-3 w-3 rounded-full ${playerColor}`}
                  ></div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {memberNickname}
                    {isUser && ' (you)'}
                  </span>
                </div>

                {!isUser && !sessionParty?.memberSessions[userId] && (
                  <p className="mt-2 text-sm text-gray-500 italic dark:text-gray-400">
                    Not started! Ask them to play
                  </p>
                )}

                {sessionParty?.memberSessions[userId]?.state.timer && (
                  <div className="text-theme-primary dark:text-theme-primary-light mt-2">
                    <TimerDisplay
                      seconds={calculateSeconds(
                        sessionParty?.memberSessions[userId]?.state.timer!
                      )}
                      isComplete={
                        !!sessionParty?.memberSessions[userId]?.state.completed
                      }
                    />
                  </div>
                )}

                {memberSession && (
                  <div className="mt-2 flex items-center">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-600">
                      <div
                        className="bg-theme-primary dark:bg-theme-primary-light h-full"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {completionPercentage}%
                    </span>
                  </div>
                )}

                {!isUser && sessionParty?.memberSessions[userId] && (
                  <div className="mt-3 rounded-lg bg-white p-2 shadow-sm dark:bg-zinc-800">
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
