// Mock react-feather icons
const React = require('react');

const mockIconComponent = (displayName) => {
  const Icon = (props) => {
    return React.createElement('svg', { ...props, 'data-testid': displayName });
  };
  Icon.displayName = displayName;
  return Icon;
};

// Create mocks for all commonly used icons
const iconNames = [
  'Loader', 'ChevronDown', 'ChevronRight', 'RotateCcw',
  'Calendar', 'Watch', 'Users', 'Droplet',
  'LogOut', 'Trash', 'UserMinus', 'Plus', 'X',
  'Home', 'Zap', 'Settings', 'Bell', 'Menu',
  'ChevronLeft', 'ArrowRight', 'Share2', 'Copy',
  'Eye', 'EyeOff', 'Check', 'AlertCircle',
  'Smartphone', 'Download'
];

const exports = {};
iconNames.forEach(name => {
  exports[name] = mockIconComponent(name);
});

module.exports = exports;
