'use client';
import { useEffect, useState } from 'react';

function useDocumentVisibility() {
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    typeof window !== 'undefined' ? !window.document.hidden : false
  );

  const handleVisibilityChange = () => {
    setIsDocumentVisible(!window.document.hidden);
  };

  useEffect(() => {
    window.document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      window.document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, []);

  return isDocumentVisible;
}

export { useDocumentVisibility };
