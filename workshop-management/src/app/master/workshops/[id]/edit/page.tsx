"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { WorkshopService } from '@/services/workshops';
import { FormField, Workshop } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormBuilder } from '@/components/form-builder/form-builder';
import { FormPreview } from '@/components/form-builder/form-preview';
import { storage } from '@/lib/appwrite';
import { ID } from 'appwrite';

const workshopSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  price: z.string().optional(),
  capacity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  formColor: z.string().optional(),
  autoApprove: z.boolean().optional(),
});

type WorkshopForm = z.infer<typeof workshopSchema>;

const workshopService = new WorkshopService();

export default function EditWorkshop() {
  console.log('🎯 EditWorkshop component is mounting');

  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();

  console.log('🎯 EditWorkshop - user:', user);
  console.log('🎯 EditWorkshop - params:', params);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [workshopImage, setWorkshopImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const workshopId = params.id as string;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkshopForm>({
    resolver: zodResolver(workshopSchema),
  });


  useEffect(() => {
    const fetchWorkshop = async () => {
      if (!user || !workshopId) {
        console.log('Missing user or workshopId:', { user: !!user, workshopId });
        return;
      }

      try {
        console.log('Fetching workshop with ID:', workshopId);
        const workshopData = await workshopService.getWorkshop(workshopId);
        console.log('Workshop data received:', workshopData);
        console.log('🎨 Loaded workshop formColor from DB:', workshopData.formColor);
        console.log('User ID:', user.$id);
        console.log('Workshop master ID:', workshopData.masterId);

        // Check if user owns this workshop
        if (workshopData.masterId !== user.$id) {
          console.log('Ownership check failed - redirecting to dashboard');
          alert('You do not own this workshop. Redirecting to dashboard.');
          router.push('/master/dashboard');
          return;
        }

        console.log('Ownership check passed');

        console.log('Workshop data received:', workshopData);
        console.log('Start date from DB:', workshopData.startDate);
        console.log('End date from DB:', workshopData.endDate);

        setWorkshop(workshopData);
        setFormFields(workshopData.applicationForm || []);
        setImagePreview(workshopData.imageUrl || null);

        // Helper function to convert ISO date to datetime-local format
        const formatDateForInput = (dateString: string | undefined): string => {
          if (!dateString) {
            console.log('No date string provided');
            return '';
          }
          try {
            console.log('Formatting date:', dateString);
            const date = new Date(dateString);
            console.log('Parsed date:', date);

            // Check if date is valid
            if (isNaN(date.getTime())) {
              console.log('Invalid date');
              return '';
            }

            // Format as YYYY-MM-DDTHH:MM for datetime-local input
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
            console.log('Formatted date:', formatted);
            return formatted;
          } catch (error) {
            console.error('Date formatting error:', error);
            return '';
          }
        };

        // Set form values
        setValue('title', workshopData.title);
        setValue('description', workshopData.description);
        setValue('category', workshopData.category);
        setValue('location', workshopData.location);
        setValue('price', workshopData.price?.toString() || '');
        setValue('capacity', workshopData.capacity?.toString() || '');
        setValue('startDate', formatDateForInput(workshopData.startDate));
        setValue('endDate', formatDateForInput(workshopData.endDate));
        setValue('formColor', workshopData.formColor || '#3B82F6');
        setValue('autoApprove', workshopData.autoApprove || false);
      } catch (error) {
        console.error('Failed to fetch workshop:', error);
        alert(`Failed to fetch workshop: ${error instanceof Error ? error.message : 'Unknown error'}`);
        router.push('/master/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshop();
  }, [user, workshopId, router, setValue]);

  if (!user || user.role !== 'master') {
    console.log('🚨 Access denied - user:', user, 'role:', user?.role);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWorkshopImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!workshopImage) return workshop.imageUrl;

    console.log('Starting image upload for edit...', workshopImage.name, workshopImage.type);
    setUploadingImage(true);
    try {
      const response = await storage.createFile(
        'workshop-images',
        ID.unique(),
        workshopImage,
        ['read("any")'] // Allow anyone to read the image
      );

      const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/workshop-images/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      console.log('Image uploaded successfully for edit:', imageUrl);

      return imageUrl;
    } catch (error) {
      console.error('Failed to upload image in edit:', error);
      return workshop.imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: WorkshopForm) => {
    setIsSaving(true);

    try {
      // Upload image if provided
      const imageUrl = await uploadImage();

      const workshopData = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        price: data.price ? parseInt(data.price) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        applicationForm: formFields,
        imageUrl,
        formColor: data.formColor || '#3B82F6',
        autoApprove: data.autoApprove || false,
      };

      console.log('Updating workshop with data:', workshopData);
      console.log('Image URL in update:', imageUrl);
      console.log('🎨 Form data.formColor:', data.formColor);
      console.log('🎨 Final workshopData.formColor:', workshopData.formColor);
      await workshopService.updateWorkshop(workshop.$id, workshopData);
      router.push(`/master/workshops/${workshop.$id}`);
    } catch (error) {
      console.error('Failed to update workshop:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Workshop
            </h1>
            <p className="mt-2 text-gray-600">
              Update your workshop details and application form
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Workshop Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workshop Title *
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="Enter workshop title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <Input
                    {...register('category')}
                    placeholder="e.g., Technology, Art, Business"
                    className={errors.category ? 'border-red-500' : ''}
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Describe your workshop..."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <Input
                    {...register('location')}
                    placeholder="Workshop location"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD)
                  </label>
                  <Input
                    {...register('price')}
                    type="number"
                    placeholder="Leave empty for free"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <Input
                    {...register('capacity')}
                    type="number"
                    placeholder="Maximum number of students"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    {...register('startDate')}
                    type="datetime-local"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    {...register('endDate')}
                    type="datetime-local"
                  />
                </div>
              </div>

              {/* New section for image, color, and auto-approve */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workshop Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Workshop preview" className="h-32 w-48 object-cover rounded-md" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form Color Theme
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={watch('formColor') || '#3B82F6'}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('🎨 Color picker changed to:', value);
                        setValue('formColor', value, { shouldValidate: true });
                      }}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={watch('formColor') || '#3B82F6'}
                      placeholder="#3B82F6"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('🎨 Text input changed to:', value);
                        setValue('formColor', value, { shouldValidate: true });
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    {...register('autoApprove')}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Auto-approve applications
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Application Form
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>

              {showPreview ? (
                <FormPreview fields={formFields} />
              ) : (
                <FormBuilder fields={formFields} onChange={setFormFields} />
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/master/workshops/${workshop.$id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || uploadingImage}>
                {isSaving ? 'Updating...' : 'Update Workshop'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}