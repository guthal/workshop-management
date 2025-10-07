"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { Workshop, FormField } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApplicationService } from '@/services/applications';

interface ApplicationFormProps {
  workshop: Workshop;
  onSuccess: () => void;
}

export function ApplicationForm({ workshop, onSuccess }: ApplicationFormProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const applicationService = new ApplicationService();

  // Use workshop's form color or default to blue
  const formColor = workshop.formColor || '#3B82F6';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!user) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create application using ApplicationService (includes auto-approve logic)
      await applicationService.createApplication({
        workshopId: workshop.$id,
        studentId: user.$id,
        responses: data,
        status: 'pending' // This will be overridden by auto-approve logic in service
      });

      onSuccess();
    } catch (error: unknown) {
      console.error('Failed to submit application:', error);
      setSubmitError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldName = field.id;
    const isRequired = field.required;

    switch (field.type) {
      case 'text-input':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              {...register(fieldName, {
                required: isRequired ? `${field.label} is required` : false
              })}
              placeholder={field.placeholder || ''}
              className={errors[fieldName] ? 'border-red-500' : ''}
              onFocus={(e) => {
                e.target.style.borderColor = formColor;
                e.target.style.boxShadow = `0 0 0 2px ${formColor}40`;
              }}
              onBlur={(e) => {
                if (!errors[fieldName]) {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors[fieldName] && (
              <p className="text-red-500 text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              {...register(fieldName, {
                required: isRequired ? `${field.label} is required` : false
              })}
              placeholder={field.placeholder || ''}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors[fieldName] ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                '--tw-ring-color': formColor,
                '--tw-ring-opacity': '0.5'
              } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.borderColor = formColor;
                e.target.style.boxShadow = `0 0 0 2px ${formColor}40`;
              }}
              onBlur={(e) => {
                if (!errors[fieldName]) {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors[fieldName] && (
              <p className="text-red-500 text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      case 'multiple-choice':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    {...register(fieldName, {
                      required: isRequired ? `Please select an option for ${field.label}` : false
                    })}
                    type="radio"
                    value={option}
                    className="focus:ring-2"
                    style={{ accentColor: formColor }}
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors[fieldName] && (
              <p className="text-red-500 text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      case 'image-upload':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-all"
              style={{
                borderColor: `${formColor}40`,
                backgroundColor: `${formColor}05`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = formColor;
                e.currentTarget.style.backgroundColor = `${formColor}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${formColor}40`;
                e.currentTarget.style.backgroundColor = `${formColor}05`;
              }}
            >
              <input
                {...register(fieldName, {
                  required: isRequired ? `${field.label} is required` : false
                })}
                type="file"
                accept="image/*"
                className="hidden"
                id={`file-${field.id}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setValue(fieldName, file.name);
                  }
                }}
              />
              <label
                htmlFor={`file-${field.id}`}
                className="cursor-pointer block"
              >
                <div className="mb-2" style={{ color: formColor }}>
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Click to upload image or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
              {watch(fieldName) && (
                <p className="text-sm font-medium mt-2" style={{ color: formColor }}>
                  ✓ Selected: {watch(fieldName)}
                </p>
              )}
            </div>
            {errors[fieldName] && (
              <p className="text-red-500 text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      case 'video-upload':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-all"
              style={{
                borderColor: `${formColor}40`,
                backgroundColor: `${formColor}05`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = formColor;
                e.currentTarget.style.backgroundColor = `${formColor}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${formColor}40`;
                e.currentTarget.style.backgroundColor = `${formColor}05`;
              }}
            >
              <input
                {...register(fieldName, {
                  required: isRequired ? `${field.label} is required` : false
                })}
                type="file"
                accept="video/*"
                className="hidden"
                id={`video-${field.id}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setValue(fieldName, file.name);
                  }
                }}
              />
              <label
                htmlFor={`video-${field.id}`}
                className="cursor-pointer block"
              >
                <div className="mb-2" style={{ color: formColor }}>
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Click to upload video or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  MP4, MOV, AVI up to 100MB
                </p>
              </label>
              {watch(fieldName) && (
                <p className="text-sm font-medium mt-2" style={{ color: formColor }}>
                  ✓ Selected: {watch(fieldName)}
                </p>
              )}
            </div>
            {errors[fieldName] && (
              <p className="text-red-500 text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="rounded-xl p-6 md:p-8"
      style={{
        backgroundColor: `${formColor}08`,
        backgroundImage: `linear-gradient(135deg, ${formColor}05 0%, ${formColor}15 100%)`,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: `${formColor}30`
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg p-6 mb-6 shadow-sm" style={{
          backgroundColor: 'white',
          borderLeftWidth: '4px',
          borderLeftStyle: 'solid',
          borderLeftColor: formColor
        }}>
          <h3 className="text-2xl font-bold mb-2" style={{ color: formColor }}>
            Application for: {workshop.title}
          </h3>
          <p className="text-sm text-gray-600">
            Please fill out the form below to apply for this workshop. All required fields must be completed.
          </p>
        </div>

        {workshop.applicationForm && workshop.applicationForm.length > 0 ? (
          <div
            className="space-y-6 rounded-lg p-6"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {workshop.applicationForm.map(renderField)}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No additional information required for this workshop.</p>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{submitError}</p>
          </div>
        )}

        <div
          className="flex justify-end space-x-3 pt-6 rounded-lg p-4"
          style={{
            backgroundColor: 'white',
            borderTopWidth: '2px',
            borderTopStyle: 'solid',
            borderTopColor: `${formColor}20`
          }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isSubmitting}
            style={{
              borderColor: `${formColor}60`,
              color: formColor
            }}
            className="hover:opacity-80"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: formColor,
              borderColor: formColor
            }}
            className="hover:opacity-90 shadow-md"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}