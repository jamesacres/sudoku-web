'use client';

import React, { createContext, useContext, useState } from 'react';

interface SudokuPlusModalContextType {
  isOpen: boolean;
  showModal: () => void;
  hideModal: () => void;
}

const SudokuPlusModalContext = createContext<
  SudokuPlusModalContextType | undefined
>(undefined);

export function SudokuPlusModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  return (
    <SudokuPlusModalContext.Provider value={{ isOpen, showModal, hideModal }}>
      {children}
    </SudokuPlusModalContext.Provider>
  );
}

export function useSudokuPlusModal() {
  const context = useContext(SudokuPlusModalContext);
  if (context === undefined) {
    throw new Error(
      'useSudokuPlusModal must be used within a SudokuPlusModalProvider'
    );
  }
  return context;
}
