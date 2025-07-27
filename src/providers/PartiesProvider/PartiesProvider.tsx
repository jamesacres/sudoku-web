'use client';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  createContext,
} from 'react';
import { UserContext } from '@/providers/UserProvider';
import { useServerStorage } from '@/hooks/serverStorage';
import { Party } from '@/types/serverTypes';

interface PartiesContextInterface {
  // Party data
  parties: Party[];
  isLoading: boolean;

  // Form state
  showCreateParty: boolean;
  setShowCreateParty: (show: boolean) => void;
  isSaving: boolean;
  memberNickname: string;
  setMemberNickname: (nickname: string) => void;
  partyName: string;
  setPartyName: (name: string) => void;

  // Actions
  saveParty: (params: {
    memberNickname: string;
    partyName: string;
  }) => Promise<Party | undefined>;
  refreshParties: (
    refreshSessionParties?: () => Promise<void>
  ) => Promise<Party[] | undefined>;
  getNicknameByUserId: (userId: string) => string | null;
  leaveParty: (partyId: string) => Promise<boolean>;
  removeMember: (partyId: string, userId: string) => Promise<boolean>;
  deleteParty: (partyId: string) => Promise<boolean>;
}

export const PartiesContext = createContext<
  PartiesContextInterface | undefined
>(undefined);

const PartiesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useContext(UserContext) || {};
  const { listParties, createParty, leaveParty, removeMember, deleteParty } =
    useServerStorage({});

  // Party state
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memberNickname, setMemberNickname] = useState(
    user?.given_name || user?.name || ''
  );
  const [partyName, setPartyName] = useState('');

  // Update member nickname when user changes
  useEffect(() => {
    setMemberNickname(user?.given_name || user?.name || '');
  }, [user]);

  // Create a new party
  const saveParty = useCallback(
    async (params: { memberNickname: string; partyName: string }) => {
      if (params.memberNickname && params.partyName) {
        setIsSaving(true);
        const party = await createParty(params);
        if (party) {
          setParties((prevParties) => [...prevParties, party]);
        }
        setMemberNickname('');
        setPartyName('');
        setShowCreateParty(false);
        setIsSaving(false);
        return party;
      }
    },
    [createParty]
  );

  // Refresh parties from server
  const refreshParties = useCallback(
    async (refreshSessionParties?: () => Promise<void>) => {
      if (!isLoading) {
        setIsLoading(true);
        const values = await listParties();
        if (values) {
          setParties(values);
        }
        if (refreshSessionParties) {
          await refreshSessionParties();
        }
        setIsLoading(false);
        return values;
      }
      return parties;
    },
    [listParties, isLoading, parties]
  );

  // Get nickname for a specific user ID across all parties
  const getNicknameByUserId = useCallback(
    (userId: string): string | null => {
      for (const party of parties) {
        const member = party.members.find((member) => member.userId === userId);
        if (member) {
          return member.memberNickname;
        }
      }
      return null;
    },
    [parties]
  );

  // Leave a party (or delete if owner)
  const handleLeaveParty = useCallback(
    async (partyId: string): Promise<boolean> => {
      const success = await leaveParty(partyId);
      if (success) {
        setParties((prevParties) =>
          prevParties.filter((party) => party.partyId !== partyId)
        );
      }
      return success;
    },
    [leaveParty]
  );

  // Remove a member from a party
  const handleRemoveMember = useCallback(
    async (partyId: string, userId: string): Promise<boolean> => {
      const success = await removeMember(partyId, userId);
      if (success) {
        setParties((prevParties) =>
          prevParties.map((party) =>
            party.partyId === partyId
              ? {
                  ...party,
                  members: party.members.filter(
                    (member) => member.userId !== userId
                  ),
                }
              : party
          )
        );
      }
      return success;
    },
    [removeMember]
  );

  // Delete a party (owner only)
  const handleDeleteParty = useCallback(
    async (partyId: string): Promise<boolean> => {
      const success = await deleteParty(partyId);
      if (success) {
        setParties((prevParties) =>
          prevParties.filter((party) => party.partyId !== partyId)
        );
      }
      return success;
    },
    [deleteParty]
  );

  // Load parties on mount
  useEffect(() => {
    let active = true;

    const loadParties = async () => {
      console.info('loadParties');
      setIsLoading(true);
      const values = await listParties();
      if (active && values) {
        setParties(values);
      }
      setIsLoading(false);
    };

    loadParties();

    return () => {
      active = false;
    };
  }, [listParties]);

  return (
    <PartiesContext.Provider
      value={{
        // Party data
        parties,
        isLoading,

        // Form state
        showCreateParty,
        setShowCreateParty,
        isSaving,
        memberNickname,
        setMemberNickname,
        partyName,
        setPartyName,

        // Actions
        saveParty,
        refreshParties,
        getNicknameByUserId,
        leaveParty: handleLeaveParty,
        removeMember: handleRemoveMember,
        deleteParty: handleDeleteParty,
      }}
    >
      {children}
    </PartiesContext.Provider>
  );
};

export default PartiesProvider;
