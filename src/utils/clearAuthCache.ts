export const clearAuthCache = () => {
  // Clear localStorage
  localStorage.removeItem('laundry-auth')
  
  // Clear any other auth-related storage
  localStorage.removeItem('admin-sidebar-collapsed')
  localStorage.removeItem('admin-sidebar-expanded')
  
  console.log('🧹 Auth cache cleared')
  
  // Reload page to get fresh data
  window.location.reload()
}