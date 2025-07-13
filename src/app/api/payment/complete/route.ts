import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { 
      planId, 
      paymentMethod, 
      walletAddress, 
      transactionHash, 
      orderRef 
    } = body

    const userId = payload.userId

    // Validate the plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Calculate subscription dates
    const startDate = new Date()
    const endDate = new Date(startDate)
    
    // Add duration based on plan
    switch (plan.id) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7)
        break
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3)
        break
      case 'biannual':
        endDate.setMonth(endDate.getMonth() + 6)
        break
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
      default:
        endDate.setMonth(endDate.getMonth() + 1) // Default to monthly
    }

    // Use Prisma transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: plan.price,
          currency: 'USDT',
          paymentMethod,
          walletAddress,
          transactionHash,
          status: 'completed',
          orderRef,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        }
      })

      // Check if user has an existing active subscription
      const existingSubscription = await tx.subscription.findFirst({
        where: {
          userId,
          status: 'active'
        }
      })

      let subscription

      if (existingSubscription) {
        // Extend existing subscription
        const newEndDate = new Date(Math.max(existingSubscription.endDate.getTime(), startDate.getTime()))
        
        // Add the plan duration to the later of current end date or today
        switch (plan.id) {
          case 'weekly':
            newEndDate.setDate(newEndDate.getDate() + 7)
            break
          case 'monthly':
            newEndDate.setMonth(newEndDate.getMonth() + 1)
            break
          case 'quarterly':
            newEndDate.setMonth(newEndDate.getMonth() + 3)
            break
          case 'biannual':
            newEndDate.setMonth(newEndDate.getMonth() + 6)
            break
          case 'annual':
            newEndDate.setFullYear(newEndDate.getFullYear() + 1)
            break
        }

        subscription = await tx.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            endDate: newEndDate,
            planId: planId, // Update to new plan
            status: 'active',
            updatedAt: new Date()
          }
        })
      } else {
        // Create new subscription
        subscription = await tx.subscription.create({
          data: {
            userId,
            planId,
            status: 'active',
            startDate,
            endDate,
            autoRenew: true
          }
        })
      }

      // Link transaction to subscription
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { subscriptionId: subscription.id }
      })

      return { transaction, subscription }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment completed and subscription activated',
      subscription: {
        id: result.subscription.id,
        status: result.subscription.status,
        startDate: result.subscription.startDate,
        endDate: result.subscription.endDate,
        plan
      },
      transaction: {
        id: result.transaction.id,
        status: result.transaction.status,
        transactionHash: result.transaction.transactionHash
      }
    })

  } catch (error) {
    console.error('Payment completion error:', error)
    return NextResponse.json({ 
      error: 'Payment processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 