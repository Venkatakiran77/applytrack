// Backend errors look like { status, error, message, timestamp }
export function getErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the API running?';
  return 'Something went wrong. Please try again.';
}