import client from './client';

export const analyzeMatch = ({ id, jdText }) =>
  client.post(`/api/applications/${id}/match`, { jdText }).then((res) => res.data);

// 404 just means "not analysed yet", which is a normal state, not an error
export const fetchMatchResult = (id) =>
  client
    .get(`/api/applications/${id}/match`)
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 404) return null;
      throw err;
    });