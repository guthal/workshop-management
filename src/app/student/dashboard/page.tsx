"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { ApplicationService } from '@/services/applications';
import { Application } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const applicationService = new ApplicationService();

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        const userApplications = await applicationService.getApplicationsByStudent(user.$id);
        setApplications(userApplications);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  if (!user || user.role !== 'student') {
    return <div>Access denied</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Applications
              </h1>
              <p className="mt-2 text-gray-600">
                Track your workshop applications and their status
              </p>
            </div>
            <Link href="/workshops">
              <Button>Browse Workshops</Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {applications.length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Applications
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {applications.length}
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
                        {applications.filter(a => a.status === 'approved').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Approved
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {applications.filter(a => a.status === 'approved').length}
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
                        {applications.filter(a => a.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {applications.filter(a => a.status === 'pending').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Applications
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                All your workshop applications and their current status
              </p>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-gray-500 mb-4">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven't applied to any workshops yet. Start exploring!
                </p>
                <Link href="/workshops">
                  <Button>Browse Workshops</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <li key={application.$id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium text-gray-900">
                              {application.workshop?.title || 'Workshop Title'}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(application.status)}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Applied on {formatDate(application.$createdAt)}
                              </p>
                            </div>
                          </div>

                          {application.status === 'approved' && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-green-800">
                                🎉 Congratulations! Your application has been approved.
                                You'll receive further instructions from the workshop master.
                              </p>
                            </div>
                          )}

                          {application.status === 'rejected' && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                Unfortunately, your application was not approved this time.
                                Don't give up - keep applying to other workshops!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          {applications.length > 0 && (
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                What's next?
              </h3>
              <div className="text-blue-700 space-y-2">
                <p>• Check back regularly for application status updates</p>
                <p>• Browse more workshops to expand your learning opportunities</p>
                <p>• Contact workshop masters directly if you have questions</p>
              </div>
              <div className="mt-4">
                <Link href="/workshops">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Explore More Workshops
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}