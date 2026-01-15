import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import DocsPage from '../page';

describe('DocsPage', () => {
  it('renders the docs heading and quick action link', () => {
    render(
      <ThemeProvider>
        <DocsPage />
      </ThemeProvider>
    );

    expect(screen.getByRole('heading', { name: 'Docs' })).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create your first agent/i })).toHaveAttribute(
      'href',
      '/dashboard/agents?action=new'
    );
  });
});
