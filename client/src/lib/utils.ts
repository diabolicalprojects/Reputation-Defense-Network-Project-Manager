export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
};

export const getWpAdminUrl = (url?: string | null): string => {
  if (!url) return '';
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  return `${cleanUrl}/wp-admin`;
};
