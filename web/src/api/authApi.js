import client from './client';

export const registerRequest = (email, password) =>
  client.post('/api/auth/register', { email, password }).then((res) => res.data);

export const loginRequest = (email, password) =>
  client.post('/api/auth/login', { email, password }).then((res) => res.data);