import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuthToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authData = verifyAdminAuthToken(request)
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date and calculate time ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    // Get basic counts
    const [
      totalUsers,
      totalActiveSubscriptions,
      totalRevenue,
      recentUsers,
      recentTransactions,
      activeSubscriptionsCount,
      expiredSubscriptionsCount,
      pendingTransactions,
      completedTransactions
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total active subscriptions
      prisma.subscription.count({
        where: { status: 'active' }
      }),
      
      // Total revenue (completed transactions)
      prisma.transaction.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      
      // Users created in last 30 days
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      
      // Recent transactions (last 30 days)
      prisma.transaction.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'completed'
        }
      }),
      
      // Active subscriptions
      prisma.subscription.count({
        where: { status: 'active' }
      }),
      
      // Expired subscriptions
      prisma.subscription.count({
        where: { status: 'expired' }
      }),
      
      // Pending transactions
      prisma.transaction.count({
        where: { status: 'pending' }
      }),
      
      // Completed transactions
      prisma.transaction.count({
        where: { status: 'completed' }
      })
    ])

    // Get recent activity (last 10 users and transactions)
    const [recentUsersList, recentTransactionsList] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ])

    // Get monthly revenue data for chart (last 12 months)
    const monthlyRevenue = await prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
        status: 'completed',
        createdAt: { gte: oneYearAgo }
      },
      _sum: {
        amount: true
      }
    })

    // Process monthly revenue for chart
    const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const monthRevenue = monthlyRevenue
        .filter(item => {
          const itemDate = new Date(item.createdAt)
          const itemKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`
          return itemKey === monthKey
        })
        .reduce((sum, item) => sum + (item._sum.amount || 0), 0)
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      }
    }).reverse()

    const stats = {
      overview: {
        totalUsers,
        totalActiveSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentUsers,
        recentTransactions
      },
      subscriptions: {
        active: activeSubscriptionsCount,
        expired: expiredSubscriptionsCount,
        total: activeSubscriptionsCount + expiredSubscriptionsCount
      },
      transactions: {
        pending: pendingTransactions,
        completed: completedTransactions,
        total: pendingTransactions + completedTransactions
      },
      recentActivity: {
        users: recentUsersList,
        transactions: recentTransactionsList
      },
      charts: {
        monthlyRevenue: revenueByMonth
      }
    }

    return NextResponse.json({ success: true, stats })

  } catch (error) {
    console.error('Admin dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 