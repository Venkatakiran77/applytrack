import client from "./client";

export const fetchDashboard = () =>
  client.get("/api/dashboard").then((res) => res.data);

export const analyzeJobDescription = (id, jdText) =>
  client
    .post(`/api/applications/${id}/match`, { jdText })
    .then((res) => res.data);
