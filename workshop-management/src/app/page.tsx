"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'master':
          router.push('/master/dashboard');
          break;
        case 'student':
          router.push('/student/dashboard');
          break;
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Workshop Platform
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Connect passionate masters with eager students. Share knowledge,
            learn new skills, and build a community of learners.
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-3">For Students</h3>
                <p className="text-gray-600">
                  Discover workshops, apply with custom forms, and learn from experts
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-3">For Masters</h3>
                <p className="text-gray-600">
                  Create workshops, build custom application forms, and manage students
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
                <p className="text-gray-600">
                  Join a platform that connects knowledge seekers with knowledge providers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
