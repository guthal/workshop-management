import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Workshop, FormField } from '@/types';

export class WorkshopService {
  async createWorkshop(data: Omit<Workshop, '$id' | '$createdAt'>) {
    try {
      const createData = {
        ...data,
        applicationForm: JSON.stringify(data.applicationForm)
      };

      // Remove undefined values to avoid Appwrite errors
      Object.keys(createData).forEach(key => {
        if (createData[key] === undefined) {
          delete createData[key];
        }
      });

      console.log('Creating workshop with data:', createData);

      const workshop = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        ID.unique(),
        createData
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
        documents: workshops.documents.map(this.parseWorkshop),
        total: workshops.total
      };
    } catch (error) {
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

      return workshops.documents.map(this.parseWorkshop);
    } catch (error) {
      throw new Error('Failed to fetch master workshops');
    }
  }

  async getWorkshop(workshopId: string) {
    try {
      const workshop = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        workshopId
      );

      return this.parseWorkshop(workshop);
    } catch (error) {
      throw new Error('Failed to fetch workshop');
    }
  }

  async updateWorkshop(workshopId: string, data: Partial<Workshop>) {
    try {
      const updateData = { ...data };

      // Convert applicationForm to JSON string if present
      if (data.applicationForm) {
        updateData.applicationForm = JSON.stringify(data.applicationForm);
      }

      // Remove undefined values to avoid Appwrite errors
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log('Sending update data to Appwrite:', updateData);

      const workshop = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WORKSHOPS,
        workshopId,
        updateData
      );

      return this.parseWorkshop(workshop);
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
    } catch (error) {
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

      return workshops.documents.map(this.parseWorkshop);
    } catch (error) {
      throw new Error('Failed to search workshops');
    }
  }

  private parseWorkshop(workshop: any): Workshop {
    return {
      ...workshop,
      applicationForm: JSON.parse(workshop.applicationForm || '[]')
    };
  }
}