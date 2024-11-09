import {
  Parties,
  PartyResult,
  SessionResult,
  useServerStorage,
} from '@/hooks/serverStorage';
import { useEffect, useState } from 'react';
import { Users, X } from 'react-feather';
import { PartyRow } from '../PartyRow/PartyRow';
import { ServerState } from '@/types/state';

const SudokuSidebar = ({
  showSidebar,
  setShowSidebar,
  sessionParties,
}: {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  sessionParties: Parties<SessionResult<ServerState>>;
}) => {
  const { listParties } = useServerStorage({});
  const [parties, setParties] = useState<PartyResult[]>([]);

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
          <button className="mt-2 w-full rounded-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700">
            <Users className="float-left mr-2" />
            Create a Party
          </button>
          <ul>
            {parties.map((party) => {
              return (
                <PartyRow
                  key={party.partyId}
                  party={party}
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
