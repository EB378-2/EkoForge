// app/api/get-role/route.ts
import { authProviderServer } from '@/providers/auth-provider/auth-provider.server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const permissions = await authProviderServer.getPermissions?.();
    console.log('permissions', permissions);
    return NextResponse.json({ role: permissions || 'anonymous' });
  } catch (error) {
    return NextResponse.json(
      { role: 'anonymous' },
      { status: 200 }
    );
  }
}