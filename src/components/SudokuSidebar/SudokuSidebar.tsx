import { memo, useContext } from 'react';
import { Loader, RefreshCw, Users, X } from 'react-feather';
import { PartyRow } from '../PartyRow/PartyRow';
import { ServerState } from '@/types/state';
import { UserContext } from '@/providers/UserProvider';
import { useParties } from '@/hooks/useParties';
import { Parties, Session } from '@/types/serverTypes';

interface Arguments {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  puzzleId: string;
  redirectUri: string;
  refreshSessionParties: () => Promise<void>;
  sessionParties: Parties<Session<ServerState>>;
}

const SudokuSidebar = ({
  showSidebar,
  setShowSidebar,
  puzzleId,
  redirectUri,
  refreshSessionParties,
  sessionParties,
}: Arguments) => {
  const { user, loginRedirect } = useContext(UserContext) || {};

  const {
    parties,
    isLoading,
    showCreateParty,
    setShowCreateParty,
    isSaving,
    memberNickname,
    setMemberNickname,
    partyName,
    setPartyName,
    saveParty,
    refreshParties,
  } = useParties({ refreshSessionParties });

  return (
    <>
      {showSidebar && (
        <div
          className="fixed top-0 left-0 z-50 h-full w-full bg-black/30 backdrop-blur-sm"
          onClick={() => {
            setShowSidebar(!showSidebar);
          }}
        ></div>
      )}
      <aside
        id="default-sidebar"
        className={`fixed top-0 left-0 z-50 h-screen w-72 xl:top-20 ${showSidebar ? '' : '-translate-x-full'} transition-transform xl:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col rounded-r-3xl bg-stone-50/90 drop-shadow-lg backdrop-blur-md dark:bg-zinc-900/95">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 rounded-tr-3xl bg-stone-50/95 px-4 pt-5 pb-3 backdrop-blur-md dark:bg-zinc-900/95">
            <div
              className="mb-4 flex-nowrap items-center xl:hidden"
              role="group"
              aria-label="Button group"
            >
              <button
                onClick={() => {
                  setShowSidebar(!showSidebar);
                }}
                className="text-theme-primary dark:text-theme-primary-light flex w-full cursor-pointer items-center justify-between rounded-full px-4 py-2 text-right"
              >
                <span className="text-lg font-medium">Friends</span>
                <X className="ml-2" />
              </button>
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
              Challenge your friends and family to solve this Sudoku puzzle with
              you!
            </p>
            {!showCreateParty && (
              <button
                className="bg-theme-primary hover:bg-theme-primary-dark mt-2 flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-3 font-medium text-white transition-colors"
                onClick={() =>
                  user
                    ? setShowCreateParty(true)
                    : loginRedirect && loginRedirect()
                }
              >
                <Users className="mr-2" size={18} />
                Create Party
              </button>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="pb-safe flex-grow overflow-y-auto px-4">
            {showCreateParty && (
              <div className="border-theme-primary/20 mt-4 rounded-2xl border bg-stone-50/50 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-800/50">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  We recommend creating more than one party, e.g. one for your
                  family and one for your friends. All party members can see
                  each other&apos;s puzzles and compete.
                </p>
                <form
                  className="w-full"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveParty({ memberNickname, partyName });
                  }}
                >
                  <label
                    className="my-2 block text-xs font-bold text-gray-700 dark:text-gray-300"
                    htmlFor="form-nickname"
                  >
                    What does the party call you?
                  </label>
                  <input
                    id="form-nickname"
                    className={`${isSaving ? 'cursor-wait' : ''} focus:ring-theme-primary mr-0 w-full appearance-none rounded-xl border border-stone-300 bg-stone-50/80 px-3 py-2.5 leading-tight text-black backdrop-blur-sm focus:ring-2 dark:border-gray-600 dark:bg-zinc-800/80 dark:text-white`}
                    type="text"
                    placeholder="Nickname"
                    aria-label="Nickname"
                    disabled={isSaving}
                    value={memberNickname}
                    onChange={(event) => {
                      setMemberNickname(event.target.value);
                    }}
                  />
                  <label
                    className="my-2 mt-4 block text-xs font-bold text-gray-700 dark:text-gray-300"
                    htmlFor="form-party-name"
                  >
                    What shall we name this party?
                  </label>
                  <div className="flex items-center">
                    <input
                      id="form-party-name"
                      className={`${isSaving ? 'cursor-wait' : ''} focus:ring-theme-primary mr-0 w-full appearance-none rounded-xl border border-stone-300 bg-stone-50/80 px-3 py-2.5 leading-tight text-black backdrop-blur-sm focus:ring-2 dark:border-gray-600 dark:bg-zinc-800/80 dark:text-white`}
                      type="text"
                      placeholder="e.g. Family"
                      aria-label="Party name"
                      disabled={isSaving}
                      value={partyName}
                      onChange={(event) => {
                        setPartyName(event.target.value);
                      }}
                    />
                  </div>
                  <button
                    className={`${isSaving ? 'cursor-wait' : 'cursor-pointer'} bg-theme-primary hover:bg-theme-primary-dark mt-4 w-full rounded-full px-4 py-2.5 font-medium text-white transition-colors`}
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader className="mx-auto animate-spin" />
                    ) : (
                      'Create Party'
                    )}
                  </button>
                </form>
              </div>
            )}

            {user && !!parties.length && (
              <>
                <div className="my-6 h-px bg-gray-200 dark:bg-gray-700" />
                <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-stone-50/95 py-2 backdrop-blur-md dark:bg-zinc-900/95">
                  <h2 className="text-xl font-semibold">Your Parties</h2>
                  <button
                    className={`${isLoading || isSaving ? 'cursor-wait' : ''} text-theme-primary dark:text-theme-primary-light cursor-pointer rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700`}
                    disabled={isLoading || isSaving}
                    onClick={() => refreshParties()}
                    aria-label="Refresh parties"
                  >
                    <RefreshCw
                      size={18}
                      className={`${isLoading ? 'animate-spin' : ''}`}
                    />
                  </button>
                </div>

                <ul className="space-y-4 pb-16">
                  {parties
                    .sort(
                      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                    )
                    .map((party) => {
                      return (
                        <PartyRow
                          key={party.partyId}
                          party={party}
                          puzzleId={puzzleId}
                          redirectUri={redirectUri}
                          sessionParty={sessionParties[party.partyId]}
                        />
                      );
                    })}
                </ul>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

// Prevent re-render on timer change
const MemoisedSudokuSidebar = memo(function MemoisedSudokuSidebar(
  args: Arguments
) {
  return SudokuSidebar(args);
});

export default MemoisedSudokuSidebar;
