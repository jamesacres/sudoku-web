import { formatSeconds } from '@/helpers/formatSeconds';

const Timer = ({ seconds }: { seconds: number }) => (
  <div className="container mx-auto max-w-screen-sm">
    <div className="">
      <p>Timer: {formatSeconds(seconds)}</p>
    </div>
  </div>
);

export { Timer };
