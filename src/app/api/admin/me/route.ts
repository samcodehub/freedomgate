import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAuthToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication token
    const authData = verifyAdminAuthToken(request);
    
    if (!authData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get admin from database
    const admin = await prisma.adminUser.findUnique({
      where: { 
        id: authData.adminId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    }, { status: 200 });

  } catch (error) {
    console.error('Get admin error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 