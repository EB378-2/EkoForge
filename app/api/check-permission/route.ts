// app/api/check-permission/route.ts
import { checkPermission } from '@/providers/access-provider/access-control.server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { role, resource, action, id } = await req.json();
  
  try {
    const { can } = await checkPermission({ // Destructure the response
      role,
      resource,
      action,
      id
    });
    console.log('Permission check:', { role, resource, action, id, can });
    return NextResponse.json({ allowed: can }); // Ensure consistent property name
  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json(
      { allowed: false, error: 'Permission check failed' }, // Include allowed field
      { status: 500 }
    );
  }
}