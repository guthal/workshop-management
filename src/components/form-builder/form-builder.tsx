"use client";

import { useState } from 'react';
import { FormField } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      required: false,
      options: type === 'multiple-choice' ? [''] : undefined,
      placeholder: type === 'text-input' || type === 'textarea' ? '' : undefined,
    };

    onChange([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    );
    onChange(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    onChange(updatedFields);
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    if (field.type === 'multiple-choice') {
      updateField(fieldIndex, {
        options: [...(field.options || []), '']
      });
    }
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = fields[fieldIndex];
    if (field.type === 'multiple-choice' && field.options) {
      const updatedOptions = field.options.map((option, i) =>
        i === optionIndex ? value : option
      );
      updateField(fieldIndex, { options: updatedOptions });
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    if (field.type === 'multiple-choice' && field.options) {
      const updatedOptions = field.options.filter((_, i) => i !== optionIndex);
      updateField(fieldIndex, { options: updatedOptions });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (draggedItem === null) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedItem];

    newFields.splice(draggedItem, 1);
    newFields.splice(targetIndex, 0, draggedField);

    onChange(newFields);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Application Form Builder
        </h3>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('text-input')}
          >
            + Text Input
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('textarea')}
          >
            + Description
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('multiple-choice')}
          >
            + Multiple Choice
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('image-upload')}
          >
            + Image Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('video-upload')}
          >
            + Video Upload
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 bg-white"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="flex items-start space-x-3">
              <div className="cursor-move mt-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Field label"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="flex-1"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm text-gray-500 capitalize">
                  {field.type.replace('-', ' ')}
                </div>

                {(field.type === 'text-input' || field.type === 'textarea') && (
                  <Input
                    placeholder="Placeholder text"
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  />
                )}

                {field.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Options:</div>
                    {field.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index, optionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(index)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No form fields yet. Add some fields above to get started.
        </div>
      )}
    </div>
  );
}