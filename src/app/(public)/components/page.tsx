

import Navbar from '~/app/_components/Navbar';
import PublicStatus from '~/app/_components/PublicStatus';
import { Button } from '~/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to StatusZen</h1>
          <p className="mt-4 text-lg text-gray-600">
            Monitor the status of your services in real-time with ease and clarity.
          </p>
          <div className="mt-6">
            <Button className="px-6 py-3 text-lg">Get Started</Button>
          </div>
        </div>
      </header>

      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-gray-800">Why Choose StatusZen?</h2>
          <p className="mt-4 text-gray-600">
            Simplify your incident management and service monitoring with intuitive dashboards,
            real-time updates, and comprehensive reports.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">Current Service Status</h2>
          <PublicStatus />
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-6 text-center">
        <p>&copy; {new Date().getFullYear()} StatusZen. All rights reserved.</p>
      </footer>
    </div>
  );
}