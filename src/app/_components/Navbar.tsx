

import { SignedOut, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="text-2xl font-bold text-gray-900">
        <Link href="/">StatusZen</Link>
      </div>
      <div className="flex space-x-4">
        <Link href="/" className="text-gray-700 hover:text-gray-900">Home</Link>
        <Link href="/organization" className="text-gray-700 hover:text-gray-900">Organization</Link>
        <SignedOut>
          <div className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
            <SignInButton />
          </div>
        </SignedOut>
        <SignedIn>
          <div className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}