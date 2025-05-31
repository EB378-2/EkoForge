// app/api/users/update-email/route.ts
import adminClient from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {


  try {
    // 1. Authentication & Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      )
    }

    // 2. Validate requesting user
    const { data: { user: requester }, error: authError } = await adminClient.auth.getUser(
      authHeader.split(' ')[1]
    )

    if (authError || !requester) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // 3. Parse and validate request body
    const { userId, newEmail, password } = await request.json()
    if (!userId || !newEmail || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 4. Authorization check (user can only update their own email unless admin)
    if (requester.id !== userId && requester.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized email update' },
        { status: 403 }
      )
    }

    // 5. Reauthenticate user (verify password)
    const { error: reauthError } = await adminClient.auth.signInWithPassword({
      email: requester.email!,
      password
    })

    if (reauthError) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 6. Update auth email
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { 
        email: newEmail,
        email_confirm: true // Skip confirmation email
      }
    )

    if (updateError) {
      throw updateError
    }

    // 7. Update profile email
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', userId)

    if (profileError) throw profileError

    // 8. Audit log
    await adminClient
      .from('audit_logs')
      .insert({
        action: 'email_update',
        user_id: userId,
        old_email: requester.email,
        new_email: newEmail,
        performed_by: requester.id
      })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email updated successfully',
        newEmail 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Email Update Error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Email update failed',
        code: error.code || 'unknown_error',
        details: error.details || null
      },
      { status: 500 }
    )
  }
}