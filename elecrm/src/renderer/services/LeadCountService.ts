// src/renderer/services/leadCountService.ts
const fetchLeadCount = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(import.meta.env.VITE_API_LEADCOUNT, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch lead count');
  }
  return await response.json();
};

export { fetchLeadCount };
