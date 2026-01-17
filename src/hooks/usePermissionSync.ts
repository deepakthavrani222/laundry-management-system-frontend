import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useRefreshPromptStore } from '@/store/refreshPromptStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PermissionSyncOptions {
  onPermissionsUpdated?: () => void;
  onRoleChanged?: (oldRole: string, newRole: string) => void;
  onAccountSuspended?: (reason: string) => void;
  onForceLogout?: (reason: string) => void;
  autoReload?: boolean; // If false, show refresh prompt instead of auto-reload
}

export function usePermissionSync(options: PermissionSyncOptions = {}) {
  const router = useRouter();
  const syncInProgressRef = useRef(false);
  const listenerAttachedRef = useRef(false);
  const { setAuth } = useAuthStore(); // Add setAuth to update store
  const { setShowPrompt } = useRefreshPromptStore(); // Add refresh prompt store

  /**
   * Show refresh prompt message
   */
  const showRefreshPrompt = useCallback(() => {
    // Show the refresh prompt component
    setShowPrompt(true);
    console.log('📋 Refresh prompt shown');
  }, [setShowPrompt]);

  /**
   * Sync permissions from server
   */
  const syncPermissions = useCallback(async () => {
    if (syncInProgressRef.current) {
      console.log('⏳ Permission sync already in progress');
      return;
    }

    syncInProgressRef.current = true;

    try {
      console.log('🔄 Starting permission sync...');
      
      // Get token from zustand persist format
      const authData = localStorage.getItem('laundry-auth');
      let token = null;
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.state?.token || parsed.token;
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
      // Fallback to direct token
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      if (!token) {
        console.log('⏭️ No token found, skipping permission sync');
        return;
      }

      console.log('🔄 Fetching updated permissions from server...');

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      const response = await fetch(`${apiUrl}/permissions/sync`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ Received updated permissions:', data.data.user.permissions);
        
        // Update zustand persist format
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            parsed.state.token = data.data.token;
            parsed.state.user = data.data.user;
            localStorage.setItem('laundry-auth', JSON.stringify(parsed));
            console.log('✅ Updated localStorage with new permissions');
          } catch (e) {
            console.error('Error updating auth data:', e);
          }
        }
        
        // Also update old format for compatibility
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Update Zustand store to trigger re-render immediately
        setAuth(data.data.user, data.data.token);
        
        console.log('✅ Permissions synced successfully');
        console.log('📊 Updated features:', Object.keys(data.data.user.features || {}).filter(k => data.data.user.features[k]));
        console.log('📊 Updated permissions:', Object.keys(data.data.user.permissions || {}));
        
        // Callback
        if (options.onPermissionsUpdated) {
          options.onPermissionsUpdated();
        }
        
        // Always show refresh prompt (no auto-reload, no flash notification)
        console.log('🔄 Permissions updated, showing refresh prompt');
        showRefreshPrompt();
      } else if (response.status === 403) {
        // Account suspended
        const data = await response.json();
        if (data.suspended) {
          console.log('🚫 Account suspended');
          toast.error('🚫 Account suspended', {
            duration: 4000,
            position: 'top-center',
          });
          if (options.onAccountSuspended) {
            options.onAccountSuspended(data.message);
          }
          handleAccountSuspended(data.message);
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        console.log('⚠️ Token expired or invalid, skipping permission sync');
        // Don't show error toast - let auth guard handle it
      } else {
        // Other errors
        console.log('⚠️ Failed to sync permissions:', response.status);
        toast.error('Failed to sync permissions', {
          duration: 3000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Failed to sync permissions:', error);
      // Don't show toast for network errors during sync
      // toast.error('Failed to sync permissions', {
      //   duration: 3000,
      //   position: 'top-center',
      // });
    } finally {
      syncInProgressRef.current = false;
    }
  }, [options, router, setAuth, showRefreshPrompt]);

  /**
   * Handle account suspension
   */
  const handleAccountSuspended = useCallback((reason: string) => {
    alert(`Your account has been suspended: ${reason}`);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  /**
   * Handle force logout
   */
  const handleForceLogout = useCallback((reason: string) => {
    console.log('🚪 Force logout:', reason);
    
    if (options.onForceLogout) {
      options.onForceLogout(reason);
    }
    
    alert(reason || 'You have been logged out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }, [options, router]);

  /**
   * Check if permissions have changed (polling fallback)
   */
  const checkPermissions = useCallback(async () => {
    try {
      // Get token from zustand persist format
      const authData = localStorage.getItem('laundry-auth');
      let token = null;
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.state?.token || parsed.token;
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
      // Fallback to direct token
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      if (!token) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      const response = await fetch(`${apiUrl}/permissions/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.data.hasChanged) {
          console.log('⚠️ Permissions have changed, syncing...');
          syncPermissions();
        }
        
        if (!data.data.isActive) {
          handleAccountSuspended('Your account has been suspended');
        }
      } else if (response.status === 401) {
        console.log('⚠️ Token invalid or expired, stopping permission checks');
        // Don't keep polling with invalid token
        return;
      }
    } catch (error) {
      // Silently fail - don't spam console with errors
      // console.error('Failed to check permissions:', error);
    }
  }, [syncPermissions, handleAccountSuspended]);

  /**
   * Initialize permission change detection
   * Uses polling as fallback when WebSocket is not available
   */
  useEffect(() => {
    if (listenerAttachedRef.current) {
      // console.log('⏭️ Permission sync already initialized');
      return;
    }

    console.log('✅ Permission sync initialized');
    listenerAttachedRef.current = true;

    // Try to attach to WebSocket if available
    let retryCount = 0;
    const maxRetries = 3;

    const tryAttachWebSocket = () => {
      retryCount++;
      
      if (typeof window !== 'undefined' && (window as any).__notificationSocket) {
        const socket = (window as any).__notificationSocket;
        
        console.log('✅ WebSocket listeners attached');

        // Listen for permission updates
        socket.on('permissionsUpdated', (data: any) => {
          console.log('📬 Permissions updated event received:', data);
          console.log('🔄 Calling syncPermissions...');
          
          // Just sync permissions, no flash notification
          syncPermissions();
        });

        socket.on('roleChanged', (data: any) => {
          console.log('📬 Role changed');
          toast.success(`👤 Role Changed: ${data.oldRole} → ${data.newRole}`, {
            duration: 3000,
            position: 'top-center',
          });
          if (options.onRoleChanged) {
            options.onRoleChanged(data.oldRole, data.newRole);
          }
          syncPermissions();
        });

        socket.on('accountSuspended', (data: any) => {
          console.log('📬 Account suspended');
          toast.error('🚫 Account Suspended', {
            duration: 4000,
            position: 'top-center',
          });
          handleAccountSuspended(data.reason);
        });

        socket.on('accountActivated', (data: any) => {
          console.log('📬 Account activated');
          toast.success('✅ Account Activated! Refreshing...', {
            duration: 3000,
            position: 'top-center',
          });
          syncPermissions();
        });

        socket.on('planChanged', (data: any) => {
          console.log('📬 Plan changed');
          toast.success('📦 Subscription Plan Updated! Refreshing...', {
            duration: 3000,
            position: 'top-center',
          });
          syncPermissions();
        });

        socket.on('forceLogout', (data: any) => {
          console.log('📬 Force logout');
          handleForceLogout(data.reason);
        });
      } else if (retryCount < maxRetries) {
        // console.log(`⏳ Waiting for WebSocket... (${retryCount}/${maxRetries})`);
        setTimeout(tryAttachWebSocket, 1000);
      }
    };

    // Try to attach WebSocket listeners
    setTimeout(tryAttachWebSocket, 500);

    // Polling disabled temporarily due to token issues
    // Will rely on WebSocket for real-time updates
    // const pollInterval = setInterval(() => {
    //   checkPermissions();
    // }, 30000);

    // console.log('✅ Permission sync initialized (WebSocket only)');

    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && (window as any).__notificationSocket) {
        const socket = (window as any).__notificationSocket;
        socket.off('permissionsUpdated');
        socket.off('roleChanged');
        socket.off('accountSuspended');
        socket.off('accountActivated');
        socket.off('planChanged');
        socket.off('forceLogout');
      }
      // clearInterval(pollInterval); // Disabled
      listenerAttachedRef.current = false;
      // console.log('🧹 Permission sync cleaned up');
    };
  }, [syncPermissions, handleAccountSuspended, handleForceLogout, options, setAuth]);

  return {
    syncPermissions,
    checkPermissions,
  };
}
