import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const usePermissionSync = () => {
  const { refreshUserData, user } = useAuthStore();
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);

  // Handle permission updates from WebSocket
  const handlePermissionUpdate = useCallback(async (event: CustomEvent) => {
    console.log('🔄 Handling permission update:', event.detail);
    
    // Prevent duplicate refreshes
    const now = Date.now();
    if (isRefreshingRef.current || (now - lastRefreshTimeRef.current) < 3000) {
      console.log('⚠️ Permission refresh already in progress or too recent, skipping');
      return;
    }
    
    try {
      isRefreshingRef.current = true;
      lastRefreshTimeRef.current = now;
      
      // Refresh user data to get latest permissions
      await refreshUserData();
      
      // Show success toast (only if not already showing)
      const existingToasts = document.querySelectorAll('[data-toast-id*="permission"]');
      if (existingToasts.length === 0) {
        toast.success('Permissions updated successfully!', {
          duration: 3000,
          icon: '🔄',
          id: 'permission-success'
        });
      }
      
      console.log('✅ Permissions refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh permissions:', error);
      
      // Show error toast (only if not already showing)
      const existingErrorToasts = document.querySelectorAll('[data-toast-id*="permission-error"]');
      if (existingErrorToasts.length === 0) {
        toast.error('Failed to refresh permissions. Page will reload automatically.', {
          duration: 3000,
          id: 'permission-error'
        });
      }
      
      // Force page reload on error
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshUserData]);

  // Listen for permission update events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for custom permission update events
    window.addEventListener('permissionsUpdated', handlePermissionUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionUpdate as EventListener);
    };
  }, [handlePermissionUpdate]);

  // Manual permission refresh function
  const refreshPermissions = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('⚠️ Permission refresh already in progress');
      return false;
    }
    
    try {
      console.log('🔄 Manually refreshing permissions...');
      isRefreshingRef.current = true;
      lastRefreshTimeRef.current = Date.now();
      
      await refreshUserData();
      toast.success('Permissions refreshed!');
      return true;
    } catch (error) {
      console.error('❌ Failed to refresh permissions:', error);
      toast.error('Failed to refresh permissions');
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshUserData]);

  return {
    refreshPermissions,
    user,
    isRefreshing: isRefreshingRef.current
  };
};