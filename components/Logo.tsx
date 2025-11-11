import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 no-underline">
        <span className="flex items-center justify-center w-10 h-10 rounded-md bg-card">
            <ArrowUpRight className="w-8 h-8" />
        </span>
        <span className="text-2xl font-medium text-foreground">Pointr</span>
    </Link>
  )
}

export default Logo
