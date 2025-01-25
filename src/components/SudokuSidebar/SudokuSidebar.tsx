import { useServerStorage } from '@/hooks/serverStorage';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { Loader, RefreshCw, Users, X } from 'react-feather';
import { PartyRow } from '../PartyRow/PartyRow';
import { ServerState } from '@/types/state';
import { UserContext } from '@/providers/UserProvider';
import { Parties, Party, Session } from '@/types/serverTypes';

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
  const { listParties, createParty } = useServerStorage({});
  const [parties, setParties] = useState<Party[]>([]);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberNickname, setMemberNickname] = useState(
    user?.given_name || user?.name || ''
  );
  const [partyName, setPartyName] = useState('');

  const saveParty = useCallback(
    async (params: { memberNickname: string; partyName: string }) => {
      if (params.memberNickname && params.partyName) {
        setIsSaving(true);
        const party = await createParty(params);
        if (party) {
          setParties((parties) => {
            return [...parties, party];
          });
        }
        setMemberNickname('');
        setPartyName('');
        setShowCreateParty(false);
        setIsSaving(false);
      }
    },
    [createParty]
  );

  const refreshParties = useCallback(async () => {
    setIsLoading(true);
    const values = await listParties();
    if (values) {
      setParties(values);
    }
    await refreshSessionParties();
    setIsLoading(false);
  }, [listParties, refreshSessionParties]);

  useEffect(() => {
    let active = true;

    const serverParties = async () => {
      const values = await listParties();
      if (active && values) {
        setParties(values);
      }
    };
    serverParties();

    return () => {
      active = false;
    };
  }, [listParties]);

  return (
    <>
      {showSidebar && (
        <div
          className="fixed top-0 left-0 z-50 h-full w-full bg-black opacity-50"
          onClick={() => {
            setShowSidebar(!showSidebar);
          }}
        ></div>
      )}
      <aside
        id="default-sidebar"
        className={`fixed top-0 left-0 z-50 h-screen w-60 xl:top-20 ${showSidebar ? '' : '-translate-x-full'} transition-transform xl:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full overflow-y-auto bg-zinc-100 px-3 py-4 drop-shadow-md dark:bg-zinc-800">
          <div
            className="flex-nowrap items-center xl:hidden"
            role="group"
            aria-label="Button group"
          >
            <button
              onClick={() => {
                setShowSidebar(!showSidebar);
              }}
              className="w-full cursor-pointer rounded-lg px-4 py-2 text-right dark:text-white"
            >
              Close
              <X className="float-right ml-2" />
            </button>
          </div>
          <p className="mb-4">
            Challenge your friends and family to solve this Sudoku puzzle with
            you!
          </p>
          {!showCreateParty && (
            <button
              className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700"
              onClick={() =>
                user
                  ? setShowCreateParty(true)
                  : loginRedirect && loginRedirect()
              }
            >
              <Users className="float-left mr-2" />
              Create Party
            </button>
          )}
          {showCreateParty && (
            <div className="rounded-sm border-2 border-neutral-500 p-2">
              <p className="mb-4">
                We recommend creating more than one party, e.g. one for your
                family and one for your friends. All party members can see each
                other&apos;s puzzles and compete.
              </p>
              <form
                className="w-full max-w-sm"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveParty({ memberNickname, partyName });
                }}
              >
                <label
                  className="my-2 block text-xs font-bold"
                  htmlFor="form-nickname"
                >
                  What does the party call you?
                </label>
                <input
                  id="form-nickname"
                  className={`${isSaving ? 'cursor-wait' : ''} mr-0 w-full appearance-none rounded-sm border-2 border-neutral-500 bg-transparent px-2 py-2 leading-tight text-black focus:outline-hidden dark:text-white`}
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
                  className="my-2 block text-xs font-bold"
                  htmlFor="form-party-name"
                >
                  What shall we name this party?
                </label>
                <div className="flex items-center">
                  <input
                    id="form-party-name"
                    className={`${isSaving ? 'cursor-wait' : ''} mr-0 w-full appearance-none rounded-l border-2 border-neutral-500 bg-transparent px-2 py-2 leading-tight text-black focus:outline-hidden dark:text-white`}
                    type="text"
                    placeholder="e.g. Family"
                    aria-label="Party name"
                    disabled={isSaving}
                    value={partyName}
                    onChange={(event) => {
                      setPartyName(event.target.value);
                    }}
                  />
                  <button
                    className={`${isSaving ? 'cursor-wait' : 'cursor-pointer'} shrink-0 rounded-r bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700`}
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader className="animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}
          {user && parties.length && (
            <>
              <hr className="my-8" />
              <h1 className="text-3xl">
                Parties
                <button
                  className={`${isLoading || isSaving ? 'cursor-wait' : ''} float-right cursor-pointer rounded-lg bg-neutral-500 px-2 py-2 text-sm text-white hover:bg-neutral-700`}
                  disabled={isLoading || isSaving}
                  onClick={() => refreshParties()}
                >
                  <RefreshCw className="float-left mr-2" size={20} /> Refresh
                </button>
              </h1>

              <ul>
                {parties
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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
