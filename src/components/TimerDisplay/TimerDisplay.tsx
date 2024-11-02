import { formatSeconds } from '@/helpers/formatSeconds';
import { Watch } from 'react-feather';

const TimerDisplay = ({
  seconds,
  countdown,
}: {
  seconds: number;
  countdown?: number;
}) => (
  <p className="min-h-8 text-center font-mono">
    {countdown ? (
      <span className="text-2xl">
        {countdown === 1 ? 'GO!' : countdown - 1}
      </span>
    ) : (
      <>
        <Watch className="m-auto inline" size={24} /> {formatSeconds(seconds)}
      </>
    )}
  </p>
);

export { TimerDisplay };
