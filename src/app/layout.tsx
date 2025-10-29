import { ThemeProvider } from '../contexts/ThemeContext';

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}