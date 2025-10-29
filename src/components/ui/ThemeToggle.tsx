import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Toggle Theme
    </button>
  );
}