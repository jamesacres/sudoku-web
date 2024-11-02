import { formatSeconds } from '@/helpers/formatSeconds';
import { Watch } from 'react-feather';

const TimerDisplay = ({ seconds }: { seconds: number }) => (
  <p className="mb-8 p-4 text-center font-mono">
    <Watch className="m-auto inline" size={24} /> {formatSeconds(seconds)}
  </p>
);

export { TimerDisplay };
