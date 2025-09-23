import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Application } from '@/types';
import { WorkshopService } from './workshops';

export class ApplicationService {
  private workshopService = new WorkshopService();

  async createApplication(data: Omit<Application, '$id' | '$createdAt'>) {
    try {
      // Check if the workshop has auto-approve enabled
      const workshop = await this.workshopService.getWorkshop(data.workshopId);
      const initialStatus = workshop.autoApprove ? 'approved' : 'pending';

      const application = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        ID.unique(),
        {
          ...data,
          status: initialStatus,
          responses: JSON.stringify(data.responses)
        }
      );
      return application;
    } catch {
      throw new Error('Failed to create application');
    }
  }

  async getApplicationsByStudent(studentId: string) {
    try {
      const applications = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        [
          Query.equal('studentId', studentId),
          Query.orderDesc('$createdAt')
        ]
      );

      return applications.documents.map(this.parseApplication);
    } catch {
      throw new Error('Failed to fetch student applications');
    }
  }

  async getApplicationsByWorkshop(workshopId: string) {
    try {
      const applications = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        [
          Query.equal('workshopId', workshopId),
          Query.orderDesc('$createdAt')
        ]
      );

      return applications.documents.map(this.parseApplication);
    } catch {
      throw new Error('Failed to fetch workshop applications');
    }
  }

  async updateApplication(applicationId: string, data: Partial<Application>) {
    try {
      const updateData = { ...data };
      if (data.responses) {
        updateData.responses = JSON.stringify(data.responses);
      }

      const application = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        applicationId,
        updateData
      );

      return this.parseApplication(application);
    } catch {
      throw new Error('Failed to update application');
    }
  }

  async approveApplication(applicationId: string) {
    return this.updateApplication(applicationId, { status: 'approved' });
  }

  async rejectApplication(applicationId: string) {
    return this.updateApplication(applicationId, { status: 'rejected' });
  }

  async deleteApplication(applicationId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        applicationId
      );
    } catch {
      throw new Error('Failed to delete application');
    }
  }

  private parseApplication(application: Record<string, unknown>): Application {
    return {
      ...(application as Application),
      responses: JSON.parse((application.responses as string) || '{}')
    };
  }
}