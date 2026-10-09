import client from './client';

export const fetchApplications = ({ page, size, status, sort }) =>
  client
    .get('/api/applications', { params: { page, size, sort, status: status || undefined } })
    .then((res) => res.data);

export const fetchApplication = (id) =>
  client.get(`/api/applications/${id}`).then((res) => res.data);

export const createApplication = (body) =>
  client.post('/api/applications', body).then((res) => res.data);

export const updateApplication = ({ id, ...body }) =>
  client.put(`/api/applications/${id}`, body).then((res) => res.data);

export const updateApplicationStatus = ({ id, status }) =>
  client.patch(`/api/applications/${id}/status`, { status }).then((res) => res.data);

export const deleteApplication = (id) => client.delete(`/api/applications/${id}`);