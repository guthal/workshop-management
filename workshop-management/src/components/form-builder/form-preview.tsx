"use client";

import { FormField } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FormPreviewProps {
  fields: FormField[];
}

export function FormPreview({ fields }: FormPreviewProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Form Preview
      </h3>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No form fields to preview
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'text-input' && (
                <Input
                  placeholder={field.placeholder}
                  disabled
                  className="bg-white"
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  placeholder={field.placeholder}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-400"
                  rows={3}
                />
              )}

              {field.type === 'multiple-choice' && (
                <div className="space-y-2">
                  {field.options?.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-2">
                      <input type="radio" disabled className="text-indigo-600" />
                      <span className="text-gray-400">{option || `Option ${optionIndex + 1}`}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'image-upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload image</p>
                  </div>
                </div>
              )}

              {field.type === 'video-upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload video</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200">
            <Button disabled className="bg-gray-300">
              Submit Application
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}