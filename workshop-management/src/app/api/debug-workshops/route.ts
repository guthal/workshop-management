import { NextResponse } from 'next/server';
import { WorkshopService } from '@/services/workshops';

const workshopService = new WorkshopService();

export async function GET() {
  try {
    const workshops = await workshopService.getWorkshops(50, 0);

    return NextResponse.json({
      success: true,
      count: workshops.documents.length,
      total: workshops.total,
      workshops: workshops.documents.map(w => ({
        id: w.$id,
        title: w.title,
        status: w.status,
        masterId: w.masterId,
        createdAt: w.$createdAt
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}