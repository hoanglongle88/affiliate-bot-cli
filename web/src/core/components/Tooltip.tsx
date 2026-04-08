import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  content,
  children,
  position = 'top',
}: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--bg-card)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--bg-card)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--bg-card)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--bg-card)]',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`pointer-events-none absolute z-50 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[var(--text-primary)] shadow-lg ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute h-0 w-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}
