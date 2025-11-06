import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Command key on Mac
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Predefined shortcuts for common actions
export const SHORTCUTS = {
  NEW_AGENT: { key: 'n', meta: true, description: 'Create new agent (Cmd+N)' },
  SEARCH: { key: 'k', meta: true, description: 'Focus search (Cmd+K)' },
  EXECUTE: { key: 'e', meta: true, description: 'Execute selected agent (Cmd+E)' },
  BULK_SELECT: { key: 'b', meta: true, description: 'Toggle bulk select mode (Cmd+B)' },
  ESCAPE: { key: 'Escape', description: 'Close modal or cancel (Esc)' },
};
