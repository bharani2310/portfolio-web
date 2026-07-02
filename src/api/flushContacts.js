export async function flushContacts(req, res) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_DATA_API_BASE_URL}/api/message-refresh`,
      {
        method: 'POST',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to trigger contact flush.',
      error: err.message,
    });
  }
}