import client from './client';

export const listResumes = () => client.get('/api/resumes').then((r) => r.data);

export const uploadResume = ({ name, file }) => {
  const fd = new FormData();
  fd.append('name', name);
  fd.append('file', file);
  return client.post('/api/resumes', fd).then((r) => r.data);
};

export const deleteResume = (id) => client.delete(`/api/resumes/${id}`);

// A plain <a href> can't send the JWT, so fetch as a blob and save it
export const downloadResume = async (resume) => {
  const res = await client.get(`/api/resumes/${resume.id}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = resume.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};