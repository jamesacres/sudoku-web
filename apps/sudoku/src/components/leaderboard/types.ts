import { ServerStateResult } from '@sudoku-web/sudoku';
import { ServerState } from '@sudoku-web/sudoku';

export interface FriendsLeaderboardScore {
  userId: string;
  username: string;
  totalScore: number;
  breakdown: {
    volumeScore: number;
    dailyPuzzleScore: number;
    bookPuzzleScore: number;
    scannedPuzzleScore: number;
    difficultyBonus: number;
    speedBonus: number;
    racingBonus: number;
  };
  stats: {
    totalPuzzles: number;
    dailyPuzzles: number;
    bookPuzzles: number;
    scannedPuzzles: number;
    averageTime: number;
    fastestTime: number;
    racingWins: number;
  };
}

export type PuzzleType = 'daily' | 'book' | 'scanned' | 'unknown';

export interface ScoringResult {
  volumeScore: number;
  dailyPuzzleScore: number;
  bookPuzzleScore: number;
  scannedPuzzleScore: number;
  difficultyBonus: number;
  speedBonus: number;
  racingBonus: number;
  stats: FriendsLeaderboardScore['stats'];
}

export type AllFriendsSessionsMap = Record<
  string,
  ServerStateResult<ServerState>[]
>;
