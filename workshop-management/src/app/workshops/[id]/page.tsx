"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { WorkshopService } from '@/services/workshops';
import { Workshop } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ApplicationForm } from '@/components/student/application-form';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const workshopService = new WorkshopService();

export default function WorkshopDetailPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);


  const workshopId = params.id as string;


  useEffect(() => {
    const fetchWorkshop = async () => {
      if (!workshopId) {
        setIsLoading(false);
        return;
      }

      try {
        const workshopData = await workshopService.getWorkshop(workshopId);

        // Only show published workshops to students
        if (workshopData.status !== 'published') {
          alert('This workshop is not available for viewing.');
          router.push('/workshops');
          return;
        }

        setWorkshop(workshopData);
      } catch (error) {
        console.error('Failed to fetch workshop:', error);
        alert(`Failed to load workshop: ${error instanceof Error ? error.message : 'Unknown error'}`);
        router.push('/workshops');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch workshop immediately, don't wait for auth
    fetchWorkshop();
  }, [workshopId, router]);

  // Handle keyboard events for image modal
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showImageModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Loading workshop details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Workshop not found</h2>
              <p className="mt-2 text-gray-600">This workshop may not be available or published.</p>
              <Link href="/workshops">
                <Button className="mt-4">← Back to Workshops</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/workshops">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workshops
              </Button>
            </Link>
          </div>

          {/* Workshop Header */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            {/* Workshop Image */}
            {workshop.imageUrl && (
              <div className="w-full flex justify-center bg-gray-50 relative">
                <div
                  className="relative group cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowImageModal(true);
                  }}
                >
                  <img
                    src={workshop.imageUrl}
                    alt={workshop.title}
                    className="max-w-full max-h-80 md:max-h-96 object-contain transition-opacity hover:opacity-90"
                    style={{ height: 'auto', width: 'auto' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                    <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-800 pointer-events-none">
                      Click to enlarge
                    </div>
                  </div>
                </div>
              </div>
            )}


            <div className="px-6 py-8">
              <div className="flex justify-between items-start mb-4">
                <span
                  className="inline-block text-sm px-3 py-1 rounded-full font-semibold"
                  style={{
                    backgroundColor: workshop.formColor ? `${workshop.formColor}20` : '#3B82F620',
                    color: workshop.formColor || '#3B82F6'
                  }}
                >
                  {workshop.category}
                </span>
                <div className="text-right">
                  {workshop.price ? (
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(workshop.price)}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-green-600">
                      Free
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {workshop.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{workshop.location}</span>
                </div>

                {workshop.startDate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{formatDate(workshop.startDate)}</span>
                  </div>
                )}

                {workshop.capacity && (
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>Max {workshop.capacity} students</span>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span className="capitalize">{workshop.scheduleType} schedule</span>
                </div>
              </div>

              {/* Apply Button */}
              {user && user.role === 'student' && !showApplicationForm && (
                <Button
                  size="lg"
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full md:w-auto"
                  style={{
                    backgroundColor: workshop.formColor || '#3B82F6',
                    borderColor: workshop.formColor || '#3B82F6'
                  }}
                >
                  Apply for this Workshop
                </Button>
              )}

              {!user && (
                <div
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: workshop.formColor ? `${workshop.formColor}10` : '#3B82F610',
                    borderColor: workshop.formColor ? `${workshop.formColor}40` : '#3B82F640'
                  }}
                >
                  <p
                    className="mb-3 font-medium"
                    style={{ color: workshop.formColor || '#3B82F6' }}
                  >
                    You need to sign in to apply for this workshop.
                  </p>
                  <div className="space-x-3">
                    <Link href="/auth/login">
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: workshop.formColor || '#3B82F6',
                          borderColor: workshop.formColor || '#3B82F6'
                        }}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        variant="outline"
                        size="sm"
                        style={{
                          borderColor: workshop.formColor || '#3B82F6',
                          color: workshop.formColor || '#3B82F6'
                        }}
                      >
                        Create Account
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {user && user.role !== 'student' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">
                    Only students can apply for workshops.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Workshop Description */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Workshop
              </h2>
              <div className="prose max-w-none text-gray-700">
                <p className="text-lg leading-relaxed">
                  {workshop.description}
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          {showApplicationForm && user && user.role === 'student' && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Application Form
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowApplicationForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <ApplicationForm
                  workshop={workshop}
                  onSuccess={() => {
                    setShowApplicationForm(false);
                    // Could show success message or redirect
                  }}
                />
              </div>
            </div>
          )}

          {/* Workshop Requirements/Info */}
          {workshop.applicationForm && workshop.applicationForm.length > 0 && !showApplicationForm && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Application Requirements
                </h2>
                <p className="text-gray-600 mb-4">
                  You&apos;ll need to provide the following information when applying:
                </p>
                <div className="space-y-3">
                  {workshop.applicationForm.map((field, index) => (
                    <div key={field.id} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && workshop?.imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={workshop.imageUrl}
              alt={workshop.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}