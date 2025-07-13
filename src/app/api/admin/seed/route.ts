import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    // Check if any admin users already exist
    const existingAdmins = await prisma.adminUser.count()
    
    if (existingAdmins > 0) {
      return NextResponse.json({
        error: 'Admin users already exist. This endpoint can only be used once.'
      }, { status: 400 })
    }

    // Create default admin user
    const defaultAdmin = {
      name: 'Admin',
      email: 'admin@freedomgate.com',
      password: 'Admin123!',
      role: 'superadmin'
    }

    const hashedPassword = await hashPassword(defaultAdmin.password)

    const admin = await prisma.adminUser.create({
      data: {
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        password: hashedPassword,
        role: defaultAdmin.role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Default admin user created successfully',
      admin: {
        ...admin,
        defaultPassword: defaultAdmin.password
      }
    })

  } catch (error) {
    console.error('Admin seed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 