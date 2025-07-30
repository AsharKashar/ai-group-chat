'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Expert Chat Platform
        </Link>
        
        <div className="flex space-x-4">
          <Link
            href="/chat"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/chat'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Multi-Expert Chat
          </Link>
          <Link
            href="/product-manager"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/product-manager'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Product Manager Chat
          </Link>
          <Link
            href="/islamic-advisor"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/islamic-advisor'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🕌 Islamic Advisor
          </Link>
        </div>
      </div>
    </nav>
  );
} 