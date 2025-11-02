'use client';

import ThemeSwitch from '../ThemeSwitch';
import ThemeColorSwitch from '../ThemeColorSwitch';

const ThemeControls = () => {
  return (
    <div className="flex items-center">
      <ThemeSwitch />
      <ThemeColorSwitch />
    </div>
  );
};

export default ThemeControls;
