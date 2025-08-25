import { useState } from 'react';
import { Check, Copy, Loader } from 'react-feather';

const CopyButton = ({
  getText,
  extraSmall = false,
  className = '',
}: {
  getText: () => Promise<string> | string;
  extraSmall?: boolean;
  className?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = async () => {
    setIsLoading(true);

    try {
      const text = await getText();
      if (text) {
        await navigator.clipboard.writeText(text);
        setShowCopied(true);
        setTimeout(() => {
          setShowCopied(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultClassName = `text-theme-primary dark:text-theme-primary-light flex cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 active:opacity-80 dark:bg-gray-700 dark:hover:bg-gray-600 ${
    extraSmall ? 'px-2 py-1 text-xs' : 'w-full px-4 py-2.5 text-sm'
  } font-medium`;

  return (
    <button
      className={className || defaultClassName}
      onClick={handleCopy}
      disabled={isLoading}
    >
      {showCopied ? (
        <>
          <Check className="mr-2" size={extraSmall ? 14 : 18} /> Copied to
          clipboard!
        </>
      ) : (
        <>
          {isLoading ? (
            <Loader
              className="mx-auto animate-spin"
              size={extraSmall ? 14 : 18}
            />
          ) : (
            <>
              <Copy className="mr-2" size={extraSmall ? 14 : 18} /> Copy Invite
              Link
            </>
          )}
        </>
      )}
    </button>
  );
};

export { CopyButton };
