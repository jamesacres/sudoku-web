// TODO: import { Timer } from '../types/timer'; // File not yet migrated from sudoku app

// TODO: Define Timer type or import from correct location
type Timer = any;

const calculateSeconds = (timer: Timer | null) => {
  let nextSeconds = 0;
  if (timer) {
    nextSeconds =
      timer.seconds +
      Math.floor(
        (new Date(timer.inProgress.lastInteraction).getTime() -
          new Date(timer.inProgress.start).getTime()) /
          1000
      );
  }
  return nextSeconds;
};

export { calculateSeconds };
