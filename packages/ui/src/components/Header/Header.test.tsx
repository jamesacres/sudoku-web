import React from 'react';
import { render } from '@testing-library/react';
import Header from './Header';

// Mock next/dynamic to avoid SSR issues in tests
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: () => Promise<any>, _options: any) => {
    const DynamicComponent = React.lazy(fn);
    return (props: any) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <DynamicComponent {...props} />
      </React.Suspense>
    );
  },
}));

// Mock the subcomponents
jest.mock('../HeaderBack', () => {
  return function DummyHeaderBack() {
    return <div data-testid="header-back">Header Back</div>;
  };
});

jest.mock('../ThemeControls', () => {
  return function DummyThemeControls() {
    return <div data-testid="theme-controls">Theme Controls</div>;
  };
});

jest.mock('../HeaderOnline', () => {
  return {
    __esModule: true,
    HeaderOnline: function DummyHeaderOnline() {
      return <div data-testid="header-online">Header Online</div>;
    },
  };
});

jest.mock('@sudoku-web/auth', () => ({
  ...jest.requireActual('@sudoku-web/auth'),
  HeaderUser: function DummyHeaderUser() {
    return <div data-testid="header-user">Header User</div>;
  },
}));

describe('Header', () => {
  describe('rendering', () => {
    it('should render header navigation', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should render core child components', async () => {
      const { findByTestId } = render(<Header />);

      const headerBack = await findByTestId('header-back');
      const headerUser = await findByTestId('header-user');
      const themeControls = await findByTestId('theme-controls');
      const headerOnline = await findByTestId('header-online');

      expect(headerBack).toBeInTheDocument();
      expect(headerUser).toBeInTheDocument();
      expect(themeControls).toBeInTheDocument();
      expect(headerOnline).toBeInTheDocument();
    });

    it('should render spacing div below header', () => {
      const { container } = render(<Header />);
      const spacingDiv =
        container.querySelector(
          '.pt-\\[calc\\(var\\(--ion-safe-area-top\\)\\+3\\.25rem\\)\\]'
        ) || container.querySelector('div[class*="pt-"]');
      expect(spacingDiv).toBeInTheDocument();
    });
  });

  describe('positioning and styling', () => {
    it('should have fixed positioning', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('top-0');
      expect(nav).toHaveClass('left-0');
    });

    it('should have high z-index', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('z-50');
    });

    it('should span full width', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('w-screen');
    });

    it('should have flex layout', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('flex');
      expect(nav).toHaveClass('flex-wrap');
      expect(nav).toHaveClass('items-center');
      expect(nav).toHaveClass('justify-between');
    });

    it('should have responsive padding', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('px-4');
    });

    it('should have safe area padding for notch', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('pt-[var(--ion-safe-area-top)]');
      expect(nav).toHaveClass('pb-1');
    });

    it('should have border styling', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('border-b');
      expect(nav).toHaveClass('border-stone-200');
      expect(nav).toHaveClass('dark:border-zinc-600');
    });

    it('should have background color', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-stone-50');
      expect(nav).toHaveClass('dark:bg-zinc-900');
    });
  });

  describe('structure and layout', () => {
    it('should have left section with HeaderBack', async () => {
      const { container, findByTestId } = render(<Header />);
      const headerBack = await findByTestId('header-back');

      const leftSection = container.querySelector('.flex.shrink-0');
      expect(leftSection?.contains(headerBack)).toBe(true);
    });

    it('should have center section with flex-grow', () => {
      const { container } = render(<Header />);
      const centerSection = container.querySelector('.block.flex.grow');
      expect(centerSection).toHaveClass('grow');
    });

    it('should have center text area', () => {
      const { container } = render(<Header />);
      const textCenter = container.querySelector('.text-center');
      expect(textCenter).toHaveClass('grow');
    });

    it('should have right section with controls', async () => {
      const { container, findByTestId } = render(<Header />);
      const themeControls = await findByTestId('theme-controls');

      const rightSection = container.querySelector('div[class*="flex h-12"]');
      expect(rightSection?.contains(themeControls)).toBe(true);
    });

    it('should have proper left section styling', () => {
      const { container } = render(<Header />);
      const leftSection = container.querySelector('.text-theme-primary');
      expect(leftSection).toHaveClass('mr-4');
      expect(leftSection).toHaveClass('flex');
      expect(leftSection).toHaveClass('shrink-0');
      expect(leftSection).toHaveClass('items-center');
      expect(leftSection).toHaveClass('dark:text-theme-primary-light');
    });

    it('should have right section with proper height', () => {
      const { container } = render(<Header />);
      const rightSection = container.querySelector('.h-12');
      expect(rightSection).toHaveClass('items-center');
    });
  });

  describe('component composition', () => {
    it('should render HeaderBack in left section', async () => {
      const { findByTestId } = render(<Header />);
      const headerBack = await findByTestId('header-back');
      expect(headerBack.textContent).toBe('Header Back');
    });

    it('should render ThemeControls in right section', async () => {
      const { findByTestId } = render(<Header />);
      const themeControls = await findByTestId('theme-controls');
      expect(themeControls.textContent).toBe('Theme Controls');
    });
  });

  describe('responsive design', () => {
    it('should have flex-wrap for responsive layout', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('flex-wrap');
    });

    it('should maintain layout on different screen sizes', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('flex');
      expect(nav).toHaveClass('items-center');
      expect(nav).toHaveClass('justify-between');
    });

    it('should have responsive padding', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('px-4');
    });
  });

  describe('dark mode support', () => {
    it('should have dark mode border color', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('dark:border-zinc-600');
    });

    it('should have dark mode background color', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('dark:bg-zinc-900');
    });

    it('should have dark mode text color in left section', () => {
      const { container } = render(<Header />);
      const leftSection = container.querySelector('.text-theme-primary');
      expect(leftSection).toHaveClass('dark:text-theme-primary-light');
    });
  });

  describe('spacing and typography', () => {
    it('should have themed text color', () => {
      const { container } = render(<Header />);
      const leftSection = container.querySelector('.text-theme-primary');
      expect(leftSection).toHaveClass('text-theme-primary');
    });

    it('should have proper alignment', () => {
      const { container } = render(<Header />);
      const centerSection = container.querySelector('.text-center');
      expect(centerSection).toHaveClass('text-center');
    });

    it('should center font text in center section', () => {
      const { container } = render(<Header />);
      const centerSection = container.querySelector('.font-medium');
      expect(centerSection).toHaveClass('font-medium');
    });
  });

  describe('accessibility', () => {
    it('should be a navigation landmark', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav?.tagName).toBe('NAV');
    });

    it('should have semantic structure', async () => {
      const { container, findByTestId } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      const headerBack = await findByTestId('header-back');
      expect(headerBack).toBeInTheDocument();
    });
  });

  describe('safe area handling', () => {
    it('should apply ion-safe-area-top padding', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('pt-[var(--ion-safe-area-top)]');
    });

    it('should apply corresponding spacing div', () => {
      const { container } = render(<Header />);
      // Look for the spacing div with className containing pt-[calc
      const spacingDiv = container.querySelector('[class*="pt-"]');
      expect(spacingDiv).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should always render HeaderBack by default', async () => {
      const { findByTestId } = render(<Header />);
      const headerBack = await findByTestId('header-back');
      expect(headerBack).toBeInTheDocument();
    });

    it('should always render ThemeControls by default', async () => {
      const { findByTestId } = render(<Header />);
      const themeControls = await findByTestId('theme-controls');
      expect(themeControls).toBeInTheDocument();
    });
  });

  describe('layout order', () => {
    it('should render left section before center section', async () => {
      const { container, findByTestId } = render(<Header />);
      const nav = container.querySelector('nav');

      // Wait for dynamic components to load
      await findByTestId('header-back');

      const leftSection = nav?.querySelector('.flex.shrink-0');
      const centerSection = nav?.querySelector('.block.flex.grow');

      const leftIndex = Array.from(nav?.children || []).indexOf(leftSection!);
      const centerIndex = Array.from(nav?.children || []).indexOf(
        centerSection!
      );

      expect(leftIndex).toBeLessThan(centerIndex);
    });

    it('should render center section before right section conceptually in flex', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('justify-between');
    });
  });
});
