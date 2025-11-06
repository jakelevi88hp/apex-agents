import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from './ui/Button';

export const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button onClick={toggleTheme}>
      {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </Button>
  );
};
