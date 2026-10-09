import client from './client';

export const fetchDashboard = () => client.get('/api/dashboard').then((res) => res.data);