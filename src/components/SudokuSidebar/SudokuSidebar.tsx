import { useServerStorage } from '@/hooks/serverStorage';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Loader, Users, X } from 'react-feather';
import { PartyRow } from '../PartyRow/PartyRow';
import { ServerState } from '@/types/state';
import { UserContext } from '@/providers/UserProvider';
import { Parties, Party, Session } from '@/types/serverTypes';

const SudokuSidebar = ({
  showSidebar,
  setShowSidebar,
  puzzleId,
  sessionParties,
}: {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  puzzleId: string;
  sessionParties: Parties<Session<ServerState>>;
}) => {
  const { user } = useContext(UserContext) || {};
  const { listParties, createParty } = useServerStorage({});
  const [parties, setParties] = useState<Party[]>([]);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
          className="fixed left-0 top-0 z-50 h-full w-full bg-black opacity-50"
          onClick={() => {
            setShowSidebar(!showSidebar);
          }}
        ></div>
      )}
      <aside
        id="default-sidebar"
        className={`fixed left-0 top-0 z-50 h-screen w-60 xl:top-20 ${showSidebar ? '' : '-translate-x-full'} transition-transform xl:translate-x-0`}
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
              className="w-full rounded-lg px-4 py-2 text-right dark:text-white"
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
              className="mt-2 w-full rounded-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700"
              onClick={() => setShowCreateParty(true)}
            >
              <Users className="float-left mr-2" />
              Create a Party
            </button>
          )}
          {showCreateParty && (
            <div className="rounded border-2 border-neutral-500 p-2">
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
                  className={`${isSaving ? 'cursor-wait' : ''} mr-0 w-full appearance-none rounded border-2 border-neutral-500 bg-transparent px-2 py-2 leading-tight text-black focus:outline-none dark:text-white`}
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
                    className={`${isSaving ? 'cursor-wait' : ''} mr-0 w-full appearance-none rounded-l border-2 border-neutral-500 bg-transparent px-2 py-2 leading-tight text-black focus:outline-none dark:text-white`}
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
                    className={`${isSaving ? 'cursor-wait' : ''} flex-shrink-0 rounded-r bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700`}
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader className="animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}
          <ul>
            {parties
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((party) => {
                return (
                  <PartyRow
                    key={party.partyId}
                    party={party}
                    puzzleId={puzzleId}
                    sessionParty={sessionParties[party.partyId]}
                  />
                );
              })}
          </ul>
        </div>
      </aside>
    </>
  );
};

export { SudokuSidebar };
