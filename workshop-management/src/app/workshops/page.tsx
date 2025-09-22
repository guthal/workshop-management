"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { WorkshopService } from '@/services/workshops';
import { Workshop } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Search, MapPin, Calendar, Users, DollarSign } from 'lucide-react';

const workshopService = new WorkshopService();

export default function WorkshopsPage() {
  const { user } = useAuthStore();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const { documents } = await workshopService.getWorkshops();
        setWorkshops(documents);
        setFilteredWorkshops(documents);
      } catch (error) {
        console.error('Failed to fetch workshops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  useEffect(() => {
    let filtered = workshops;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        workshop =>
          workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workshop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workshop.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(workshop => workshop.category === selectedCategory);
    }

    setFilteredWorkshops(filtered);
  }, [workshops, searchQuery, selectedCategory]);

  const categories = Array.from(new Set(workshops.map(w => w.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Workshops
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn new skills from expert masters. Find the perfect workshop for your interests and goals.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workshops by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>Showing {filteredWorkshops.length} of {workshops.length} workshops</span>
            </div>
          </div>

          {/* Workshop Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading workshops...</div>
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-500 mb-4">
                {workshops.length === 0 ? 'No workshops available yet' : 'No workshops match your search'}
              </div>
              {workshops.length === 0 && (
                <p className="text-gray-400">
                  Check back later for new workshops from our amazing masters!
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((workshop) => (
                <div key={workshop.$id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Workshop Image */}
                  {workshop.imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={workshop.imageUrl}
                        alt={workshop.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                        {workshop.category}
                      </span>
                      {workshop.price ? (
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(workshop.price)}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-green-600">
                          Free
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {workshop.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {workshop.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {workshop.location}
                      </div>

                      {workshop.startDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(workshop.startDate)}
                        </div>
                      )}

                      {workshop.capacity && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          Max {workshop.capacity} students
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-500">
                        <span className="capitalize">
                          {workshop.scheduleType} schedule
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Link href={`/workshops/${workshop.$id}`} className="flex-1">
                        <Button className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Call to Action */}
          {!user && workshops.length > 0 && (
            <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to start learning?
              </h3>
              <p className="text-gray-600 mb-4">
                Create an account to apply for workshops and track your applications.
              </p>
              <div className="space-x-4">
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}