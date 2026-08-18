import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'xs';
}

export function CopyButton({ value, label, className, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-2 py-0.5 gap-1 h-6'
    : 'text-xs px-2.5 py-1 gap-1.5 h-7';

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center rounded-md border font-medium transition-colors',
        copied
          ? 'border-green-300 bg-green-50 text-green-700'
          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
        sizeClasses,
        className
      )}
    >
      {copied
        ? <><Check className="h-3 w-3" />{label ? `${label} copied` : 'Copied'}</>
        : <><Copy className="h-3 w-3" />{label ?? 'Copy'}</>
      }
    </button>
  );
}
