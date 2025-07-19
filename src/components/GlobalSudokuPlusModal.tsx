'use client';

import { useSudokuPlusModal } from '@/providers/SudokuPlusModalProvider';
import SudokuPlusModal from './SudokuPlusModal';

const GlobalSudokuPlusModal = () => {
  const { isOpen, hideModal } = useSudokuPlusModal();

  return <SudokuPlusModal isOpen={isOpen} onClose={hideModal} />;
};

export default GlobalSudokuPlusModal;
