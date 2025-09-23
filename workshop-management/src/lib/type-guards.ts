import { User, Workshop, Application, FormField } from '@/types';

// Type guard functions to validate data structure
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).$id === 'string' &&
    typeof (obj as any).email === 'string' &&
    typeof (obj as any).name === 'string' &&
    ['admin', 'master', 'student'].includes((obj as any).role)
  );
}

export function isFormField(obj: unknown): obj is FormField {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).type === 'string' &&
    typeof (obj as any).label === 'string' &&
    typeof (obj as any).required === 'boolean'
  );
}

export function isFormFieldArray(obj: unknown): obj is FormField[] {
  return Array.isArray(obj) && obj.every(isFormField);
}

// Safe conversion functions
export function safeParseWorkshop(data: Record<string, unknown>): Workshop {
  const applicationFormString = typeof data.applicationForm === 'string'
    ? data.applicationForm
    : '[]';

  let applicationForm: FormField[];
  try {
    const parsed = JSON.parse(applicationFormString);
    applicationForm = isFormFieldArray(parsed) ? parsed : [];
  } catch {
    applicationForm = [];
  }

  return {
    $id: String(data.$id || ''),
    masterId: String(data.masterId || ''),
    title: String(data.title || ''),
    description: String(data.description || ''),
    category: String(data.category || ''),
    location: String(data.location || ''),
    price: typeof data.price === 'number' ? data.price : undefined,
    capacity: typeof data.capacity === 'number' ? data.capacity : undefined,
    scheduleType: ['fixed', 'flexible'].includes(data.scheduleType as string)
      ? (data.scheduleType as 'fixed' | 'flexible')
      : undefined,
    startDate: typeof data.startDate === 'string' ? data.startDate : undefined,
    endDate: typeof data.endDate === 'string' ? data.endDate : undefined,
    applicationForm,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    formColor: typeof data.formColor === 'string' ? data.formColor : undefined,
    autoApprove: typeof data.autoApprove === 'boolean' ? data.autoApprove : undefined,
    status: ['draft', 'published', 'cancelled'].includes(data.status as string)
      ? (data.status as 'draft' | 'published' | 'cancelled')
      : 'draft',
    $createdAt: String(data.$createdAt || ''),
    master: data.master && typeof data.master === 'object' && isUser(data.master)
      ? data.master
      : undefined,
    enrolledCount: typeof data.enrolledCount === 'number' ? data.enrolledCount : undefined,
  };
}

export function safeParseApplication(data: Record<string, unknown>): Application {
  const responsesString = typeof data.responses === 'string'
    ? data.responses
    : '{}';

  let responses: Record<string, unknown>;
  try {
    responses = JSON.parse(responsesString);
  } catch {
    responses = {};
  }

  return {
    $id: String(data.$id || ''),
    workshopId: String(data.workshopId || ''),
    studentId: String(data.studentId || ''),
    responses,
    status: ['pending', 'approved', 'rejected'].includes(data.status as string)
      ? (data.status as 'pending' | 'approved' | 'rejected')
      : 'pending',
    $createdAt: String(data.$createdAt || ''),
    workshop: data.workshop && typeof data.workshop === 'object'
      ? safeParseWorkshop(data.workshop as Record<string, unknown>)
      : undefined,
    student: data.student && typeof data.student === 'object' && isUser(data.student)
      ? data.student
      : undefined,
  };
}

export function safeParseUser(data: Record<string, unknown>): User {
  let profile: { avatar?: string; bio?: string; location?: string };

  if (typeof data.profile === 'string') {
    try {
      profile = JSON.parse(data.profile);
    } catch {
      profile = {};
    }
  } else if (typeof data.profile === 'object' && data.profile !== null) {
    profile = data.profile as any;
  } else {
    profile = {};
  }

  return {
    $id: String(data.$id || ''),
    email: String(data.email || ''),
    name: String(data.name || ''),
    role: ['admin', 'master', 'student'].includes(data.role as string)
      ? (data.role as 'admin' | 'master' | 'student')
      : 'student',
    profile,
    $createdAt: String(data.$createdAt || ''),
  };
}

// Utility function to safely remove undefined values
export function removeUndefinedValues<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  Object.keys(result).forEach(key => {
    if (result[key] === undefined) {
      delete result[key];
    }
  });
  return result;
}