import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuthToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authData = verifyAdminAuthToken(request)
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, verified, unverified
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.UserWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status !== 'all') {
      where.isVerified = status === 'verified'
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          language: true,
          createdAt: true,
          updatedAt: true,
          subscriptions: {
            where: { status: 'active' },
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              planId: true,
              status: true,
              startDate: true,
              endDate: true
            }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const authData = verifyAdminAuthToken(request)
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action, data } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result

    switch (action) {
      case 'verify':
        result = await prisma.user.update({
          where: { id: userId },
          data: { isVerified: true }
        })
        break
        
      case 'unverify':
        result = await prisma.user.update({
          where: { id: userId },
          data: { isVerified: false }
        })
        break
        
      case 'update':
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            name: data.name,
            email: data.email,
            language: data.language
          }
        })
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`,
      user: result
    })

  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 