import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId

    // Fetch user's active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['active', 'pending']
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Fetch user's transaction history
    const transactions = await prisma.transaction.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Last 10 transactions
    })

    // Format subscription data with plan details
    let subscriptionData = null
    if (activeSubscription) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === activeSubscription.planId)
      subscriptionData = {
        id: activeSubscription.id,
        status: activeSubscription.status,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        autoRenew: activeSubscription.autoRenew,
        plan: plan || {
          id: activeSubscription.planId,
          name: 'Unknown Plan',
          price: 0,
          duration: '1 month'
        }
      }
    }

    return NextResponse.json({
      subscription: subscriptionData,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        paymentMethod: t.paymentMethod,
        status: t.status,
        createdAt: t.createdAt,
        transactionHash: t.transactionHash
      }))
    })

  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 