// providers/access-provider/access-control.client.ts
'use client';
import { CanParams, CanReturnType } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";

interface AuthIdentity {
  id: string;
  role?: string;
}

export const accessControlProvider = {
  can: async ({ resource, action, params }: CanParams): Promise<CanReturnType> => {
    try {
      // Get role from multiple sources
      const role = typeof window !== 'undefined' 
        ? localStorage.getItem('user-role') || 'anonymous'
        : 'anonymous';

      // Prepare the request body with additional context
      const requestBody = {
        role,
        resource,
        action,
        id: params?.id,
        // Add timestamp to prevent caching issues
        timestamp: Date.now()
      };

      const res = await fetch('/api/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Permission check failed: ${res.status}`);
      }

      const { allowed } = await res.json();
      
      return {
        can: allowed,
        reason: allowed ? undefined : `No ${action} access to ${resource}`
      };
    } catch (error) {
      console.error('Access control error:', error);
      return { 
        can: false, 
        reason: error instanceof Error ? error.message : "Error checking permissions" 
      };
    }
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: false,
    },
  }
};