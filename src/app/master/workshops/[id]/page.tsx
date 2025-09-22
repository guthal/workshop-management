"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { WorkshopService } from '@/services/workshops';
import { ApplicationService } from '@/services/applications';
import { Workshop, Application } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const workshopService = new WorkshopService();
const applicationService = new ApplicationService();

export default function ManageWorkshop() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const workshopId = params.id as string;

  useEffect(() => {
    const fetchWorkshop = async () => {
      if (!user || !workshopId) return;

      try {
        const workshopData = await workshopService.getWorkshop(workshopId);

        // Check if user owns this workshop
        if (workshopData.masterId !== user.$id) {
          router.push('/master/dashboard');
          return;
        }

        setWorkshop(workshopData);

        // Fetch applications for this workshop
        try {
          const workshopApplications = await applicationService.getApplicationsByWorkshop(workshopId);
          setApplications(workshopApplications);
        } catch (error) {
          console.error('Failed to fetch applications:', error);
        } finally {
          setApplicationsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch workshop:', error);
        router.push('/master/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshop();
  }, [user, workshopId, router]);

  const handlePublish = async () => {
    if (!workshop) return;

    try {
      const updatedWorkshop = await workshopService.updateWorkshop(workshop.$id, {
        status: 'published'
      });
      setWorkshop(updatedWorkshop);
    } catch (error) {
      console.error('Failed to publish workshop:', error);
    }
  };

  const handleUnpublish = async () => {
    if (!workshop) return;

    try {
      const updatedWorkshop = await workshopService.updateWorkshop(workshop.$id, {
        status: 'draft'
      });
      setWorkshop(updatedWorkshop);
    } catch (error) {
      console.error('Failed to unpublish workshop:', error);
    }
  };

  const handleDelete = async () => {
    if (!workshop || !confirm('Are you sure you want to delete this workshop?')) return;

    try {
      await workshopService.deleteWorkshop(workshop.$id);
      router.push('/master/dashboard');
    } catch (error) {
      console.error('Failed to delete workshop:', error);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      await applicationService.approveApplication(applicationId);
      // Refresh applications list
      const updatedApplications = await applicationService.getApplicationsByWorkshop(workshopId);
      setApplications(updatedApplications);
    } catch (error) {
      console.error('Failed to approve application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await applicationService.rejectApplication(applicationId);
      // Refresh applications list
      const updatedApplications = await applicationService.getApplicationsByWorkshop(workshopId);
      setApplications(updatedApplications);
    } catch (error) {
      console.error('Failed to reject application:', error);
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

  if (!user || user.role !== 'master') {
    return <div>Access denied</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Loading workshop...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Workshop not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Workshop
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your workshop settings and view applications
              </p>
            </div>
            <Link href="/master/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {workshop.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Workshop details and settings
                  </p>
                </div>
                <div className="flex space-x-3">
                  {workshop.status === 'draft' ? (
                    <Button onClick={handlePublish}>
                      Publish Workshop
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleUnpublish}>
                      Unpublish
                    </Button>
                  )}
                  <Link href={`/master/workshops/${workshop.$id}/edit`}>
                    <Button variant="outline">
                      Edit Workshop
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workshop.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : workshop.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {workshop.status}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900">{workshop.category}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{workshop.location}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {workshop.price ? formatCurrency(workshop.price) : 'Free'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {workshop.capacity || 'Unlimited'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Schedule Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {workshop.scheduleType}
                  </dd>
                </div>

                {workshop.startDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(workshop.startDate)}
                    </dd>
                  </div>
                )}

                {workshop.endDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(workshop.endDate)}
                    </dd>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{workshop.description}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Application Form Preview */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Application Form
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Preview of the form students will fill out
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              {workshop.applicationForm && workshop.applicationForm.length > 0 ? (
                <div className="space-y-4">
                  {workshop.applicationForm.map((field, index) => (
                    <div key={field.id} className="border-l-4 border-blue-200 pl-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {field.type.replace('-', ' ')} field
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No application form configured</p>
              )}
            </div>
          </div>

          {/* Applications Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Applications ({applications.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Student applications for this workshop
              </p>
            </div>

            <div className="border-t border-gray-200">
              {applicationsLoading ? (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  Loading applications...
                </div>
              ) : applications.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No applications yet. Applications will appear here once students start applying.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <li key={application.$id} className="px-4 py-5 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {application.student?.name || 'Student Name'}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {application.student?.email || 'No email available'}
                          </p>

                          <p className="text-sm text-gray-500 mb-4">
                            Applied on {formatDate(application.$createdAt)}
                          </p>

                          {/* Application Responses */}
                          {application.responses && Object.keys(application.responses).length > 0 && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Application Responses:</h5>
                              <div className="space-y-2">
                                {Object.entries(application.responses).map(([fieldId, response]) => {
                                  const field = workshop?.applicationForm?.find(f => f.id === fieldId);
                                  return (
                                    <div key={fieldId} className="text-sm">
                                      <span className="font-medium text-gray-700">
                                        {field?.label || fieldId}:
                                      </span>
                                      <span className="ml-2 text-gray-600">
                                        {typeof response === 'string' ? response : JSON.stringify(response)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {application.status === 'pending' && (
                            <div className="mt-4 flex space-x-3">
                              <Button
                                size="sm"
                                onClick={() => handleApproveApplication(application.$id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectApplication(application.$id)}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          {application.status === 'approved' && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-green-800">
                                ✅ Application approved. You can contact the student at {application.student?.email}
                              </p>
                            </div>
                          )}

                          {application.status === 'rejected' && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                ❌ Application rejected.
                              </p>
                            </div>
                          )}
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
    </div>
  );
}