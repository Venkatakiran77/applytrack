import client from './client';

export const fetchSkills = () => client.get('/api/skills').then((res) => res.data);

export const addSkill = (name) => client.post('/api/skills', { name }).then((res) => res.data);

export const deleteSkill = (id) => client.delete(`/api/skills/${id}`);