import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PartyInviteButton } from './PartyInviteButton';
import * as serverStorageModule from '@sudoku-web/template';

jest.mock('@sudoku-web/template', () => ({
  __esModule: true,
  useServerStorage: jest.fn(),
  CopyButton: ({
    getText,
    partyName,
    extraSmall,
  }: {
    getText: () => Promise<string>;
    partyName: string;
    extraSmall?: boolean;
  }) => {
    const [text, setText] = React.useState('');
    React.useEffect(() => {
      getText().then(setText);
    }, [getText]);
    return (
      <div
        data-testid="copy-button"
        data-party={partyName}
        data-extra-small={extraSmall}
        data-text={text}
      >
        Copy: {partyName}
      </div>
    );
  },
}));

const mockUseServerStorage = serverStorageModule.useServerStorage as jest.Mock;

describe('PartyInviteButton', () => {
  const defaultProps = {
    puzzleId: 'puzzle123',
    redirectUri: '/puzzle/123',
    partyId: 'party1',
    partyName: 'Test Party',
  };

  let mockCreateInvite: jest.Mock;

  beforeEach(() => {
    mockCreateInvite = jest.fn().mockResolvedValue({ inviteId: 'invite123' });
    mockUseServerStorage.mockReturnValue({ createInvite: mockCreateInvite });
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create an invite and generate the URL', async () => {
    render(<PartyInviteButton {...defaultProps} />);

    await waitFor(() => {
      expect(mockCreateInvite).toHaveBeenCalledWith({
        sessionId: `sudoku-${defaultProps.puzzleId}`,
        redirectUri: defaultProps.redirectUri,
        expiresAt: new Date('2024-01-08').toISOString(),
        description: defaultProps.partyName,
        resourceId: `party-${defaultProps.partyId}`,
      });
    });

    await waitFor(() => {
      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toHaveAttribute(
        'data-text',
        'https://sudoku.bubblyclouds.com/invite?inviteId=invite123'
      );
    });
  });

  it('should handle invite creation failure gracefully', async () => {
    mockCreateInvite.mockResolvedValue(null);
    render(<PartyInviteButton {...defaultProps} />);

    await waitFor(() => {
      expect(mockCreateInvite).toHaveBeenCalled();
    });

    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toHaveAttribute('data-text', '');
  });
});
