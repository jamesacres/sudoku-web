import { formatSeconds } from '@/helpers/formatSeconds';
import { Watch } from 'react-feather';

const TimerDisplay = ({
  seconds,
  countdown,
  isComplete,
}: {
  seconds: number;
  countdown?: number;
  isComplete?: boolean;
}) => {
  let content;
  if (isComplete) {
    content = (
      <span className="text-xl">👏🎉 {formatSeconds(seconds)} 🎉👏</span>
    );
  } else if (countdown) {
    content = (
      <span className="text-2xl">
        {countdown === 1 ? 'GO!' : countdown - 1}
      </span>
    );
  } else {
    content = (
      <>
        <Watch className="m-auto inline" size={24} /> {formatSeconds(seconds)}
      </>
    );
  }
  return <p className="min-h-8 text-right font-mono">{content}</p>;
};
export { TimerDisplay };
