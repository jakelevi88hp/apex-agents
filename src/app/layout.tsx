import { ThemeProvider } from '../contexts/ThemeContext';

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <div className='app-container'>
        {children}
      </div>
    </ThemeProvider>
  );
}
