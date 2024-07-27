import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Link href="/puzzle?puzzleId=1">Load Puzzle 1</Link>
      <Link href="/import">Import</Link>
    </>
  );
}
