import Link from 'next/link';
import type { ReactNode } from 'react';

const LINK_PATTERN = '\\[([^\\]]+)\\]\\(([^)\\s]+)\\)';

/**
 * Renders blog text with markdown-style inline links: [label](/path).
 * Internal paths use next/link; https URLs open normally. Anything else is
 * left as plain text.
 */
export default function BlogText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const linkRe = new RegExp(LINK_PATTERN, 'g');
  while ((match = linkRe.exec(text)) !== null) {
    const [full, label, href] = match;
    if (match.index > last) parts.push(text.slice(last, match.index));
    const cls = 'text-purple-300 underline underline-offset-4 hover:text-white';
    if (href.startsWith('/')) {
      parts.push(
        <Link key={match.index} href={href} className={cls}>
          {label}
        </Link>,
      );
    } else if (href.startsWith('https://')) {
      parts.push(
        <a key={match.index} href={href} className={cls}>
          {label}
        </a>,
      );
    } else {
      parts.push(full);
    }
    last = match.index + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
