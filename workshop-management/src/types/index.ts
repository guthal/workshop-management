export interface User {
  $id: string;
  email: string;
  name: string;
  role: 'admin' | 'master' | 'student';
  profile: {
    avatar?: string;
    bio?: string;
    location?: string;
  };
  $createdAt: string;
}

export interface FormField {
  id: string;
  type: 'multiple-choice' | 'image-upload' | 'video-upload' | 'text-input' | 'textarea';
  label: string;
  required: boolean;
  options?: string[]; // For multiple choice
  placeholder?: string;
}

export interface Workshop {
  $id: string;
  masterId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price?: number;
  capacity?: number;
  scheduleType?: 'fixed' | 'flexible';
  startDate?: string;
  endDate?: string;
  applicationForm: FormField[];
  imageUrl?: string;
  formColor?: string;
  autoApprove?: boolean;
  status: 'draft' | 'published' | 'cancelled';
  $createdAt: string;
  master?: User;
  enrolledCount?: number;
}

export interface Application {
  $id: string;
  workshopId: string;
  studentId: string;
  responses: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  $createdAt: string;
  workshop?: Workshop;
  student?: User;
}

export interface Payment {
  $id: string;
  applicationId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
  $createdAt: string;
}