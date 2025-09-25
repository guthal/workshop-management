"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { WorkshopService } from '@/services/workshops';
import { FormField } from '@/types';
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

export default function CreateWorkshop() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [workshopImage, setWorkshopImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Debug: Check if component is rendering
  useEffect(() => {
    console.log('🎨 CreateWorkshop component mounted');
    console.log('🎨 Current formColor value:', watch('formColor'));
  }, [watch]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkshopForm>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      formColor: '#3B82F6',
      autoApprove: false,
    },
  });


  if (!user || user.role !== 'master') {
    return <div>Access denied</div>;
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
    if (!workshopImage) {
      console.log('🖼️ No workshop image selected, skipping upload');
      return undefined;
    }

    console.log('🖼️ Starting image upload...', workshopImage.name, workshopImage.type);
    setUploadingImage(true);
    try {
      const response = await storage.createFile(
        'workshop-images',
        ID.unique(),
        workshopImage,
        ['read("any")']
      );

      console.log('🖼️ Storage response:', response);

      const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/workshop-images/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      console.log('🖼️ Generated image URL:', imageUrl);
      console.log('🖼️ Environment variables:', {
        endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
        project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
      });

      return imageUrl;
    } catch (error) {
      console.error('🖼️ Failed to upload image:', error);
      console.error('🖼️ Error details:', JSON.stringify(error, null, 2));
      return undefined;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: WorkshopForm) => {
    setIsLoading(true);

    try {
      // Upload image if provided
      const imageUrl = await uploadImage();

      const workshopData = {
        masterId: user.$id,
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
        status: 'draft' as const,
      };

      console.log('🖼️ Image upload result:', imageUrl);
      console.log('🖼️ Workshop image state:', workshopImage);
      console.log('🎨 Form data.formColor:', data.formColor);
      console.log('🎨 Final workshopData.formColor:', workshopData.formColor);
      console.log('🖼️ Final workshopData.imageUrl:', workshopData.imageUrl);

      await workshopService.createWorkshop(workshopData);
      router.push('/master/dashboard');
    } catch (error) {
      console.error('Failed to create workshop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Workshop
            </h1>
            <p className="mt-2 text-gray-600">
              Fill in the details and create an application form for your workshop
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
                  <div className="mb-2 text-sm text-gray-600">
                    Current value: <strong>{watch('formColor') || '#3B82F6'}</strong>
                  </div>
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🎨 Test button clicked');
                        alert('Test button clicked');
                        setValue('formColor', '#FF0000', { shouldValidate: true });
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Test: Set Red
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={watch('formColor') || '#3B82F6'}
                      onInput={(e) => {
                        const value = (e.target as HTMLInputElement).value;
                        console.log('🎨 Color picker onInput:', value);
                        alert(`Color picker onInput: ${value}`);
                        setValue('formColor', value, { shouldValidate: true });
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('🎨 Color picker onChange:', value);
                        alert(`Color picker onChange: ${value}`);
                        setValue('formColor', value, { shouldValidate: true });
                      }}
                      onClick={() => {
                        console.log('🎨 Color picker clicked!');
                        alert('Color picker clicked!');
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
                onClick={() => router.push('/master/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || uploadingImage}>
                {uploadingImage ? 'Uploading Image...' : isLoading ? 'Creating...' : 'Create Workshop'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}