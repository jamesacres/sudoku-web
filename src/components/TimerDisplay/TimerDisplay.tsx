import { formatSeconds } from '@/helpers/formatSeconds';
import { Watch } from 'react-feather';

const TimerDisplay = ({ seconds }: { seconds: number }) => (
  <p>
    <Watch className="inline" /> {formatSeconds(seconds)}
  </p>
);

export { TimerDisplay };
