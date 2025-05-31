//api/users/update-role-status/route.ts
import adminClient from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {


  try {
    // Parse and validate request
    const { userId, role, status } = await request.json()
    
    if (!userId || typeof role === 'undefined' || typeof status === 'undefined') {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role, or status' },
        { status: 400 }
      )
    }

    // Update auth user (sets role in JWT)
    const { data: authUser, error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      { 
        app_metadata: { role },
        user_metadata: { role }, // Sets role in JWT claims
      }
    )

    if (authError) throw authError

    // Update profile in database
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ 
        role,
        status 
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user_id: userId,
      new_role: role,
      new_status: status,
      updated_at: new Date().toISOString()
    }, { status: 200 })

  } catch (error: any) {
    console.error('User update error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'User update failed',
      details: error.details || null,
      
    }, { status: 500 })
  }
}