import { ServerStateResult } from '@sudoku-web/template/types/serverTypes';
import { ServerState } from '@sudoku-web/sudoku/types/state';

export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

export interface UserSessions {
  [userId: string]: UserSession | undefined;
}
