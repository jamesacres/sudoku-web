'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { SudokuBookOfTheMonth } from '@/types/serverTypes';
import { useServerStorage } from '@/hooks/serverStorage';

interface BookContextType {
  bookData: SudokuBookOfTheMonth | null;
  isLoading: boolean;
  error: string | null;
  fetchBookData: () => Promise<void>;
  clearBookData: () => void;
}

const BookContext = createContext<BookContextType | null>(null);

interface BookProviderProps {
  children: ReactNode;
}

export const BookProvider = ({ children }: BookProviderProps) => {
  const [bookData, setBookData] = useState<SudokuBookOfTheMonth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSudokuBookOfTheMonth } = useServerStorage();

  const fetchBookData = useCallback(async () => {
    // If data already exists or currently loading, don't fetch again
    if (bookData || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getSudokuBookOfTheMonth();
      if (result) {
        setBookData(result);
      } else {
        setError('Failed to load book data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book data');
    } finally {
      setIsLoading(false);
    }
  }, [bookData, isLoading, getSudokuBookOfTheMonth]);

  const clearBookData = useCallback(() => {
    setBookData(null);
    setError(null);
  }, []);

  return (
    <BookContext.Provider
      value={{
        bookData,
        isLoading,
        error,
        fetchBookData,
        clearBookData,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};
