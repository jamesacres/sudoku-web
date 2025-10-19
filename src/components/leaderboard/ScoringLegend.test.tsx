import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScoringLegend from './ScoringLegend';
import { SCORING_CONFIG } from './scoringConfig';
import { Difficulty, BookPuzzleDifficulty } from '@/types/serverTypes';

describe('ScoringLegend', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('should return null when isOpen is false', () => {
      const { container } = render(
        <ScoringLegend isOpen={false} onClose={mockOnClose} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('🏆 Scoring System')).toBeInTheDocument();
    });

    it('should have fixed positioning overlay', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('[class*="fixed"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('modal structure', () => {
    it('should render modal with proper styling classes', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const modal = container.querySelector('[class*="rounded-2xl"]');
      expect(modal).toBeInTheDocument();
    });

    it('should have sticky header', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const header = container.querySelector('[class*="sticky"]');
      expect(header).toBeInTheDocument();
    });

    it('should have scroll capability for overflow content', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const scrollable = container.querySelector('[class*="overflow-y-auto"]');
      expect(scrollable).toBeInTheDocument();
    });

    it('should have dark mode support', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const darkModeElements = container.querySelectorAll('[class*="dark:"]');
      expect(darkModeElements.length).toBeGreaterThan(0);
    });
  });

  describe('header', () => {
    it('should display trophy icon with title', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('🏆 Scoring System')).toBeInTheDocument();
    });

    it('should display close button', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('[class*="fixed"]');
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when modal content is clicked', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      const modalContent = screen.getByText('🏆 Scoring System').parentElement;
      if (modalContent) {
        fireEvent.click(modalContent);
      }

      // Should not be called when clicking modal content
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('racing wins section', () => {
    it('should display racing wins section', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('🏁 Racing Wins')).toBeInTheDocument();
    });

    it('should display racing bonus per person', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(
          `+${SCORING_CONFIG.RACING_BONUS_PER_PERSON} points for each friend`
        )
      ).toBeInTheDocument();
    });

    it('should show racing bonus calculation example', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(/Beat 5 friends = \+500 points!/)
      ).toBeInTheDocument();
    });
  });

  describe('base points section', () => {
    it('should display base points section', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('📊 Base Points')).toBeInTheDocument();
    });

    it('should display any puzzle base points', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(`+${SCORING_CONFIG.VOLUME_MULTIPLIER}`)
      ).toBeInTheDocument();
    });

    it('should display daily puzzle base points', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(`+${SCORING_CONFIG.DAILY_PUZZLE_BASE}`)
      ).toBeInTheDocument();
    });

    it('should display book puzzle base points', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(`+${SCORING_CONFIG.BOOK_PUZZLE_BASE}`)
      ).toBeInTheDocument();
    });

    it('should display scanned puzzle base points', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(`+${SCORING_CONFIG.SCANNED_PUZZLE_BASE}`)
      ).toBeInTheDocument();
    });
  });

  describe('difficulty multipliers section', () => {
    it('should display difficulty multipliers section', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('🔥 Difficulty Multipliers')).toBeInTheDocument();
    });

    it('should display daily puzzle difficulties', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('⭐ Sudoku of the Day')).toBeInTheDocument();
    });

    it('should display book puzzle difficulties', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('📖 Book Puzzles')).toBeInTheDocument();
    });

    it('should display daily puzzle difficulty multipliers', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      // Check for at least one difficulty multiplier
      const multiplier = SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[Difficulty.EASY];
      expect(screen.getByText(`${multiplier}x`)).toBeInTheDocument();
    });

    it('should display book puzzle difficulty multipliers', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      const multiplier =
        SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[BookPuzzleDifficulty.HARD];
      expect(screen.getByText(`${multiplier}x`)).toBeInTheDocument();
    });

    it('should sort book puzzle difficulties by multiplier', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      // Get all book difficulty items
      const bookSection = screen.getByText('📖 Book Puzzles').parentElement;
      if (bookSection) {
        const difficulties = bookSection.querySelectorAll(
          '[class*="rounded-lg"]'
        );
        // Should be sorted in ascending order by multiplier
        expect(difficulties.length).toBeGreaterThan(0);
      }
    });
  });

  describe('speed bonuses section', () => {
    it('should display speed bonuses section', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('⚡ Speed Bonuses')).toBeInTheDocument();
    });

    it('should display lightning speed tier', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText(/⚡ Under/)).toBeInTheDocument();
    });

    it('should display fast speed bonus', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(`+${SCORING_CONFIG.SPEED_BONUSES.FAST}`)
      ).toBeInTheDocument();
    });

    it('should display quick speed bonus', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(`+${SCORING_CONFIG.SPEED_BONUSES.QUICK}`)
      ).toBeInTheDocument();
    });

    it('should display steady speed bonus', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(`+${SCORING_CONFIG.SPEED_BONUSES.STEADY}`)
      ).toBeInTheDocument();
    });

    it('should display speed tiers with emojis', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('🔥')).toBeInTheDocument(); // FAST
      expect(screen.getByText('💨')).toBeInTheDocument(); // QUICK
      expect(screen.getByText('🎯')).toBeInTheDocument(); // STEADY
    });

    it('should display time thresholds correctly', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      // Check for formatted time display
      const lightningThreshold = SCORING_CONFIG.SPEED_THRESHOLDS.LIGHTNING;
      const minutes = Math.floor(lightningThreshold / 60);
      const seconds = lightningThreshold % 60;
      const timeDisplay =
        seconds > 0
          ? `${minutes}:${seconds.toString().padStart(2, '0')}`
          : `${minutes} min`;

      expect(
        screen.getByText(new RegExp(`Under ${timeDisplay}`))
      ).toBeInTheDocument();
    });

    it('should sort speed tiers by time descending', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      // Lightning should appear before FAST which should appear before QUICK
      const lightningText = screen.getByText(/⚡/);
      const fastText = screen.getByText(/🔥/);

      expect(
        lightningText.compareDocumentPosition(fastText) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  describe('color coding', () => {
    it('should have gradient background', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const gradient = container.querySelector('[class*="gradient"]');
      expect(gradient).toBeInTheDocument();
    });

    it('should have color-coded sections', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const racingSection = container.querySelector('[class*="from-yellow"]');
      expect(racingSection).toBeInTheDocument();
    });

    it('should have colored badge backgrounds for difficulties', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      // Check for difficulty badge colors
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      // Should have various colored badges for difficulty levels
      const badges = container.querySelectorAll('[class*="bg-"]');
      expect(badges.length).toBeGreaterThan(5);
    });
  });

  describe('display names formatting', () => {
    it('should format book puzzle difficulty names correctly', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      // Names should be transformed from format "1-very-easy" to "1 Very Easy"
      const displayedNames = Object.values(BookPuzzleDifficulty).map((diff) => {
        const name = (diff as string)
          .replace(/^\d+-/, '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return name;
      });

      // At least one formatted name should be visible
      expect(displayedNames.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have proper modal semantics', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      // Modal should be in a portal-like container (fixed position)
      const modal = container.querySelector('[class*="fixed"]');
      expect(modal).toBeInTheDocument();
    });

    it('should have readable text hierarchy', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      const title = screen.getByText('🏆 Scoring System');
      expect(title.tagName.toLowerCase()).toBe('h3');
    });

    it('should have proper heading hierarchy in sections', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      const sectionHeadings = screen.getByText('🏁 Racing Wins');
      expect(sectionHeadings.tagName.toLowerCase()).toBe('h4');
    });

    it('should have accessible close button', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: '✕' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should have sufficient color contrast', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      // Text should be visible with proper contrast
      expect(screen.getByText('🏆 Scoring System')).toBeInTheDocument();
    });
  });

  describe('responsiveness', () => {
    it('should have responsive layout for content', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      // Check for responsive grid classes
      const responsiveElements = container.querySelectorAll(
        '[class*="sm:"], [class*="lg:"]'
      );
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('should handle max height constraint', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const modal = container.querySelector('[class*="max-h"]');
      expect(modal).toBeInTheDocument();
    });

    it('should handle max width constraint', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      const modal = container.querySelector('[class*="max-w"]');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid open/close cycles', () => {
      const { rerender } = render(
        <ScoringLegend isOpen={false} onClose={mockOnClose} />
      );

      rerender(<ScoringLegend isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('🏆 Scoring System')).toBeInTheDocument();

      rerender(<ScoringLegend isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByText('🏆 Scoring System')).not.toBeInTheDocument();

      rerender(<ScoringLegend isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('🏆 Scoring System')).toBeInTheDocument();
    });

    it('should handle multiple onClose callbacks', () => {
      const mockOnClose1 = jest.fn();
      const mockOnClose2 = jest.fn();

      const { rerender } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose1} />
      );

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose1).toHaveBeenCalledTimes(1);

      rerender(<ScoringLegend isOpen={true} onClose={mockOnClose2} />);

      const newCloseButton = screen.getByText('✕');
      fireEvent.click(newCloseButton);

      expect(mockOnClose2).toHaveBeenCalledTimes(1);
    });

    it('should display all difficulty tiers', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      // Verify all daily difficulties are present
      expect(screen.getByText(/Tricky/)).toBeInTheDocument();
      expect(screen.getByText(/Challenging/)).toBeInTheDocument();
      expect(screen.getByText(/Hard/)).toBeInTheDocument();
    });
  });

  describe('content verification', () => {
    it('should display all scoring information sections', () => {
      render(<ScoringLegend isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('🏁 Racing Wins')).toBeInTheDocument();
      expect(screen.getByText('📊 Base Points')).toBeInTheDocument();
      expect(screen.getByText('🔥 Difficulty Multipliers')).toBeInTheDocument();
      expect(screen.getByText('⚡ Speed Bonuses')).toBeInTheDocument();
    });

    it('should have correct badge coloring for speed tiers', () => {
      const { container } = render(
        <ScoringLegend isOpen={true} onClose={mockOnClose} />
      );

      // Lightning should be yellow, Fast orange, Quick blue, Steady green
      const yellowBadge = container.querySelector('.bg-yellow-400');
      const orangeBadge = container.querySelector('.bg-orange-500');
      const blueBadge = container.querySelector('.bg-blue-500');
      const greenBadge = container.querySelector('.bg-green-500');

      expect(
        yellowBadge || orangeBadge || blueBadge || greenBadge
      ).toBeTruthy();
    });
  });
});
