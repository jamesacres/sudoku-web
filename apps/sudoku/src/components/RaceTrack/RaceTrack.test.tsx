import React from 'react';
import { render, screen } from '@testing-library/react';
import RaceTrack from './RaceTrack';
import * as usePartiesModule from '@/hooks/useParties';
import * as playerColorsModule from '@sudoku-web/template';
import * as completionModule from '@sudoku-web/sudoku';
import * as cheatDetectionModule from '@sudoku-web/sudoku';
import { Parties, Session } from '@sudoku-web/sudoku';
import { ServerState } from '@sudoku-web/sudoku';

jest.mock('@/hooks/useParties');
jest.mock('@sudoku-web/template', () => ({
  getPlayerColor: jest.fn(() => 'bg-blue-500'),
  getAllUserIds: jest.fn(() => ['userId1', 'userId2']),
  formatSeconds: jest.fn((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }),
  Tab: {
    HOME: 'home',
    FRIENDS: 'friends',
    BOOK: 'book',
    SETTINGS: 'settings',
  },
}));
jest.mock('@sudoku-web/sudoku', () => ({
  ...jest.requireActual('@sudoku-web/sudoku'),
  calculateCompletionPercentage: jest.fn(() => 50),
  isPuzzleCheated: jest.fn(() => false),
}));
jest.mock('@/helpers/calculateCompletionPercentage');
jest.mock('@/components/TrafficLight', () => ({
  TrafficLight: () => <div data-testid="traffic-light" />,
}));

const mockUseParties = usePartiesModule.useParties as jest.Mock;
const mockGetPlayerColor = playerColorsModule.getPlayerColor as jest.Mock;
const mockGetAllUserIds = playerColorsModule.getAllUserIds as jest.Mock;
const mockCalculateCompletionPercentage =
  completionModule.calculateCompletionPercentage as jest.Mock;
const mockIsPuzzleCheated = cheatDetectionModule.isPuzzleCheated as jest.Mock;

describe('RaceTrack', () => {
  const mockSessionParties: Parties<Session<ServerState>> = {
    party1: {
      memberSessions: {
        userId2: {
          sessionId: 'session-userId2',
          updatedAt: new Date(),
          state: {
            initial: [],
            final: [],
            answerStack: [[]],
            completed: { seconds: 120, at: new Date().toISOString() },
          } as any,
        },
      },
    },
  };

  const defaultProps = {
    sessionParties: mockSessionParties,
    initial: [],
    final: [],
    answer: [],
    userId: 'userId1',
    onClick: jest.fn(),
    countdown: undefined,
    completed: { seconds: 100, at: new Date().toISOString() },
    refreshSessionParties: jest.fn(),
    isPolling: false,
    answerStack: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParties.mockReturnValue({
      getNicknameByUserId: () => 'Player 2',
      parties: [],
      refreshParties: jest.fn(),
    });
    mockGetAllUserIds.mockReturnValue(['userId1', 'userId2']);
    mockGetPlayerColor.mockReturnValue('bg-blue-500');
    mockCalculateCompletionPercentage.mockReturnValue(50);
    mockIsPuzzleCheated.mockReturnValue(false);
  });

  it('renders the race track with players', () => {
    render(<RaceTrack {...defaultProps} />);
    expect(screen.getByText('START')).toBeInTheDocument();
    expect(screen.getByText('FINISH')).toBeInTheDocument();
    expect(screen.getByText(/Player 2/)).toBeInTheDocument();
  });

  it('shows the traffic light when countdown is active', () => {
    render(<RaceTrack {...defaultProps} countdown={3} />);
    expect(screen.getByTestId('traffic-light')).toBeInTheDocument();
  });

  it('displays a leaderboard of finished players', () => {
    mockCalculateCompletionPercentage.mockReturnValue(100);
    render(<RaceTrack {...defaultProps} />);
    expect(screen.getByText(/1\./)).toBeInTheDocument();
  });

  it('shows completion UI when the current user has finished', () => {
    mockCalculateCompletionPercentage.mockImplementation(
      (initial, final, answer) => (answer === defaultProps.answer ? 100 : 50)
    );
    render(<RaceTrack {...defaultProps} />);
    expect(screen.getByText(/View Monthly Leaderboard/)).toBeInTheDocument();
  });
});
