import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const now = new Date()
    
    // Update expired subscriptions
    const result = await prisma.subscription.updateMany({
      where: {
        status: 'active',
        endDate: {
          lt: now
        }
      },
      data: {
        status: 'expired',
        updatedAt: now
      }
    })

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} expired subscriptions`
    })

  } catch (error) {
    console.error('Subscription expiry check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check subscription expiry' 
    }, { status: 500 })
  }
} 