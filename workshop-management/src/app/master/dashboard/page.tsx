"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { WorkshopService } from '@/services/workshops';
import { Workshop } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

const workshopService = new WorkshopService();

export default function MasterDashboard() {
  const { user } = useAuthStore();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      if (!user) return;

      try {
        const userWorkshops = await workshopService.getWorkshopsByMaster(user.$id);
        setWorkshops(userWorkshops);
      } catch (error) {
        console.error('Failed to fetch workshops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, [user]);

  if (!user || user.role !== 'master') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Master Dashboard
            </h1>
            <Link href="/master/workshops/create">
              <Button>Create Workshop</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {workshops.length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Workshops
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {workshops.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {workshops.filter(w => w.status === 'published').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Published
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {workshops.filter(w => w.status === 'published').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {workshops.filter(w => w.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Drafts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {workshops.filter(w => w.status === 'draft').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Workshops
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your workshops and view applications
              </p>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">Loading workshops...</div>
            ) : workshops.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No workshops yet</p>
                <Link href="/master/workshops/create">
                  <Button className="mt-4">Create Your First Workshop</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {workshops.map((workshop) => (
                  <li key={workshop.$id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {workshop.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {workshop.description.substring(0, 150)}...
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {workshop.category}</span>
                            <span>Location: {workshop.location}</span>
                            {workshop.price && (
                              <span>Price: {formatCurrency(workshop.price)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            workshop.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : workshop.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {workshop.status}
                          </span>
                          <Link href={`/master/workshops/${workshop.$id}`}>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}