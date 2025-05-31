import { NextResponse } from "next/server";
import adminClient from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "userId, currentPassword and newPassword are required" },
        { status: 400 }
      );
    }

    // Get user email first
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(
      userId
    );

    if (userError || !userData.user?.email) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const { error: authError } = await adminClient.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Update password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Password update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Password update failed",
        details: error.details,
      },
      { status: 500 }
    );
  }
}