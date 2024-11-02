import { formatSeconds } from '@/helpers/formatSeconds';
import { Watch } from 'react-feather';

const TimerDisplay = ({ seconds }: { seconds: number }) => (
  <p className="text-center font-mono">
    <Watch className="m-auto inline" size={24} /> {formatSeconds(seconds)}
  </p>
);

export { TimerDisplay };
