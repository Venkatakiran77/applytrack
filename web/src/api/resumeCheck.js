import client from './client';

export const checkResume = (resumeId, jdText) =>
  client.post(`/api/resumes/${resumeId}/check`, { jdText }).then((res) => res.data);