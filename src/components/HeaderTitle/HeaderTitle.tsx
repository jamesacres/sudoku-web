'use client';
import { usePathname } from 'next/navigation';

const HeaderBack = () => {
  const pathname = usePathname();
  return (
    <div className="grow text-center font-medium">
      {pathname === '/' && <span className="text-md">Sudoku Share</span>}
    </div>
  );
};

export default HeaderBack;
