'use client';

import Script from 'next/script';
import { useCallback, useState } from 'react';

export default function Home() {
  const [solution, setSolution] = useState<string | undefined>(undefined);
  const ready = useCallback(() => {
    setSolution(
      (window as any).Module.ccall(
        'solve',
        'string',
        ['string'],
        [
          '.1...3.942....5...7....82...67......1..4....6.4..81..5....72.....3....8.......1.3',
        ]
      )
    );
  }, []);
  return (
    <>
      {solution !== undefined && <div>{solution}</div>}
      <Script
        src="/solve.js" // Copyright (c) 2019, Tom Dillon https://github.com/t-dillon/tdoku
        onReady={() => {
          if ((window as any).Module) {
            if ((window as any).Module.onRuntimeInitialized) {
              ready();
            } else {
              (window as any).Module.onRuntimeInitialized = function () {
                ready();
              };
            }
          }
        }}
      />
    </>
  );
}
