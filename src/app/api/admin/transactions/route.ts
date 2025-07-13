import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuthToken } from '@/lib/auth'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminPayload = verifyAdminAuthToken(request)
    if (!adminPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const offset = (page - 1) * limit

    // Build where clause
    const where: Prisma.TransactionWhereInput = {}
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { orderRef: { contains: search, mode: 'insensitive' } },
        { transactionHash: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.status = status
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          subscription: {
            select: {
              id: true,
              planId: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminPayload = verifyAdminAuthToken(request)
    if (!adminPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { transactionId, action, newStatus, transactionHash } = body

    let updatedTransaction

    switch (action) {
      case 'updateStatus':
        updatedTransaction = await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: newStatus },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            subscription: {
              select: {
                id: true,
                planId: true,
                status: true
              }
            }
          }
        })
        break

      case 'updateHash':
        updatedTransaction = await prisma.transaction.update({
          where: { id: transactionId },
          data: { transactionHash },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            subscription: {
              select: {
                id: true,
                planId: true,
                status: true
              }
            }
          }
        })
        break

      case 'approve':
        // Update transaction status to completed and activate related subscription
        const transaction = await prisma.transaction.findUnique({
          where: { id: transactionId },
          include: { subscription: true }
        })

        if (!transaction) {
          return NextResponse.json(
            { success: false, error: 'Transaction not found' },
            { status: 404 }
          )
        }

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
          // Update transaction status
          const updatedTx = await tx.transaction.update({
            where: { id: transactionId },
            data: { status: 'completed' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              subscription: {
                select: {
                  id: true,
                  planId: true,
                  status: true
                }
              }
            }
          })

          // If there's a related subscription, activate it
          if (transaction.subscriptionId) {
            await tx.subscription.update({
              where: { id: transaction.subscriptionId },
              data: { status: 'active' }
            })
          }

          return updatedTx
        })

        updatedTransaction = result
        break

      case 'reject':
        updatedTransaction = await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'failed' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            subscription: {
              select: {
                id: true,
                planId: true,
                status: true
              }
            }
          }
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: `Transaction ${action} successful`
    })

  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 