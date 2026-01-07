/**
 * Format order number for display
 * Converts long order numbers to shorter, more readable format
 */
export function formatOrderNumber(orderNumber: string): string {
  // If already in new format (ORD + 6 digits + 3 digits), return as-is
  if (/^ORD\d{9}$/.test(orderNumber)) {
    return orderNumber;
  }
  
  // If old long format, create a shorter display version
  if (/^ORD\d{13,}/.test(orderNumber)) {
    // Extract the last 6 digits as a shorter reference
    const shortRef = orderNumber.slice(-6);
    return `ORD-${shortRef}`;
  }
  
  // Return as-is for any other format
  return orderNumber;
}

/**
 * Get order number for search/API calls (always use full number)
 */
export function getFullOrderNumber(orderNumber: string): string {
  return orderNumber;
}

/**
 * Format order number with date context if available
 */
export function formatOrderNumberWithDate(orderNumber: string, createdAt?: string | Date): string {
  const formatted = formatOrderNumber(orderNumber);
  
  if (createdAt && /^ORD-\d{6}$/.test(formatted)) {
    const date = new Date(createdAt);
    const dateStr = date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
    return `${formatted} (${dateStr})`;
  }
  
  return formatted;
}