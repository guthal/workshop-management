import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Workshop } from '@/types';
import { safeParseWorkshop, removeUndefinedValues } from '@/lib/type-guards';

export class WorkshopService {
  async createWorkshop(data: Omit<Workshop, '$id' | '$createdAt'>) {
    try {
      const createData = {
        ...data,
        applicationForm: JSON.stringify(data.applicationForm)
      };

      // Remove undefined values to avoid Appwrite errors
      const cleanData = removeUndefinedValues(createData);

      console.log('Creating workshop with data:', cleanData);

      const workshop = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        ID.unique(),
        cleanData
      );
      return workshop;
    } catch (error) {
      console.error('Create workshop error:', error);
      throw new Error('Failed to create workshop');
    }
  }

  async getWorkshops(limit = 25, offset = 0) {
    try {
      const workshops = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        [
          Query.equal('status', 'published'),
          Query.limit(limit),
          Query.offset(offset),
          Query.orderDesc('$createdAt')
        ]
      );

      return {
        documents: workshops.documents.map(doc => safeParseWorkshop(doc as Record<string, unknown>)),
        total: workshops.total
      };
    } catch {
      throw new Error('Failed to fetch workshops');
    }
  }

  async getWorkshopsByMaster(masterId: string) {
    try {
      const workshops = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        [
          Query.equal('masterId', masterId),
          Query.orderDesc('$createdAt')
        ]
      );

      return workshops.documents.map(doc => safeParseWorkshop(doc as Record<string, unknown>));
    } catch {
      throw new Error('Failed to fetch master workshops');
    }
  }

  async getWorkshop(workshopId: string) {
    try {
      console.log('📍 WorkshopService.getWorkshop - Fetching workshop:', workshopId);

      const workshop = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        workshopId
      );

      console.log('📍 WorkshopService.getWorkshop - Raw workshop data:', workshop);
      console.log('📍 WorkshopService.getWorkshop - Workshop status:', workshop.status);

      const parsed = safeParseWorkshop(workshop as Record<string, unknown>);
      console.log('📍 WorkshopService.getWorkshop - Parsed workshop:', parsed);

      return parsed;
    } catch (error) {
      console.error('📍 WorkshopService.getWorkshop - Error:', error);
      throw new Error('Failed to fetch workshop');
    }
  }

  async updateWorkshop(workshopId: string, data: Partial<Workshop>) {
    try {
      const updateData: Record<string, unknown> = { ...data };

      // Convert applicationForm to JSON string if present
      if (data.applicationForm) {
        updateData.applicationForm = JSON.stringify(data.applicationForm);
      }

      // Remove undefined values to avoid Appwrite errors
      const cleanData = removeUndefinedValues(updateData);

      console.log('Sending update data to Appwrite:', cleanData);

      const workshop = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        workshopId,
        cleanData
      );

      return safeParseWorkshop(workshop as Record<string, unknown>);
    } catch (error) {
      console.error('Update workshop error:', error);
      throw new Error('Failed to update workshop');
    }
  }

  async deleteWorkshop(workshopId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        workshopId
      );
    } catch {
      throw new Error('Failed to delete workshop');
    }
  }

  async searchWorkshops(query: string, category?: string) {
    try {
      const queries = [
        Query.equal('status', 'published'),
        Query.search('title', query)
      ];

      if (category) {
        queries.push(Query.equal('category', category));
      }

      const workshops = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        queries
      );

      return workshops.documents.map(doc => safeParseWorkshop(doc as Record<string, unknown>));
    } catch {
      throw new Error('Failed to search workshops');
    }
  }

}