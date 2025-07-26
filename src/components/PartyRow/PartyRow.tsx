import { Party, SessionParty, Session } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { PartyInviteButton } from '../PartyInviteButton/PartyInviteButton';
import SimpleSudoku from '../SimpleSudoku';
import { TimerDisplay } from '../TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage';
import { getPlayerColor, getAllUserIds } from '@/utils/playerColors';
import { useParties } from '@/hooks/useParties';
import { useContext, useState } from 'react';
import { UserContext } from '@/providers/UserProvider';
import { PartyConfirmationDialog } from '../PartyConfirmationDialog/PartyConfirmationDialog';
import { LogOut, Trash, UserMinus } from 'react-feather';
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
  const { parties, leaveParty, removeMember, deleteParty } = useParties();
  const { user } = useContext(UserContext) || {};
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'leave' | 'remove';
    memberName?: string;
    userId?: string;
  }>({ isOpen: false, type: 'leave' });

  // Get consistent ordering of all user IDs for color assignment
  const allUserIds = getAllUserIds(parties);

  const handleDeleteParty = async () => {
    await deleteParty(partyId);
  };

  const handleLeaveParty = async () => {
    await leaveParty(partyId);
  };

  const handleRemoveMember = async () => {
    if (confirmDialog.userId) {
      await removeMember(partyId, confirmDialog.userId);
    }
  };

  return (
    <li>
      <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-zinc-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-theme-primary dark:text-theme-primary-light text-xl font-semibold">
            {partyName}
          </h3>

          <button
            type="button"
            className={`inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${'bg-red-100 text-red-700 hover:bg-red-200 focus-visible:ring-red-500 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'}`}
            onClick={() => setConfirmDialog({ isOpen: true, type: 'leave' })}
          >
            {isOwner ? (
              <Trash className="h-3 w-3" />
            ) : (
              <LogOut className="h-3 w-3" />
            )}
          </button>
        </div>

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
          {members.map(({ memberNickname, userId, isUser }) => {
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`mr-2 h-3 w-3 rounded-full ${playerColor}`}
                    ></div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {memberNickname}
                      {isUser && ' (you)'}
                    </span>
                  </div>

                  {isOwner && !isUser && (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: 'remove',
                          memberName: memberNickname,
                          userId,
                        })
                      }
                    >
                      <UserMinus className="h-3 w-3" />
                    </button>
                  )}
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
                  <div className="mt-3 rounded-lg bg-stone-50 p-2 shadow-sm dark:bg-zinc-800">
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

      <PartyConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, type: confirmDialog.type })
        }
        onConfirm={
          confirmDialog.type === 'leave'
            ? isOwner
              ? handleDeleteParty
              : handleLeaveParty
            : handleRemoveMember
        }
        type={confirmDialog.type}
        partyName={partyName}
        memberName={confirmDialog.memberName}
        isOwner={isOwner}
      />
    </li>
  );
};

export { PartyRow };
