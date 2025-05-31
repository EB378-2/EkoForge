// lib/access-control.server.ts
import { newEnforcer } from 'casbin';
import { model, adapter } from './permissions';

interface PermissionCheckParams {
  role: string;
  resource: string;
  action: string;
  id?: string;
}

export async function checkPermission({
  role,
  resource,
  action,
  id
}: PermissionCheckParams): Promise<{ can: boolean }> {
  const enforcer = await newEnforcer(model, adapter);
  
  try {
    // Convert action to match policy format
    const formattedAction = action.toLowerCase();
    const baseResource = resource.split('/')[0];

    // 1. Check wildcard permissions first
    const wildcardCheck = await enforcer.enforce(role, `${baseResource}/*`, formattedAction);
    if (wildcardCheck) return { can: true };

    // 2. Check specific resource permission
    const resourceCheck = await enforcer.enforce(role, baseResource, formattedAction);
    
    // 3. For specific instances, check ownership
    if (id && ['edit', 'delete', 'show'].includes(formattedAction)) {
      const instanceCheck = await enforcer.enforce(role, `${baseResource}/${id}`, formattedAction);
      return { can: resourceCheck && instanceCheck };
    }

    return { can: resourceCheck };
  } catch (error) {
    console.error('Permission check error:', {
      role,
      resource,
      action,
      id,
      error
    });
    return { can: false };
  }
}