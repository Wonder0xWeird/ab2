import { NextResponse } from 'next/server';
import { getDocsSections } from '@/lib/docs';

export async function GET() {
  try {
    const sections = await getDocsSections();
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching docs sections:', error);
    return NextResponse.json(
      { error: 'Failed to load documentation sections' },
      { status: 500 }
    );
  }
} 