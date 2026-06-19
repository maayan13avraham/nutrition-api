const BASE_URL = process.env.REACT_APP_API_URL;

// Build auth headers from the stored session for use with the native fetch API
function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    'Content-Type': 'application/json',
    'x-user-id': user.userId || '',
    'x-user-role': user.userRole || '',
  };
}

// Stream a chat response from the AI endpoint using Server-Sent Events (SSE)
// Calls onText for each arriving text chunk, onDone when complete, onError on failure
export async function streamChat({ profile, menu, messages, lang }, onText, onDone, onError) {
  try {
    const response = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ profile, menu, messages, lang }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      onError(err?.error?.code || err?.error?.message || 'Server error');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    // Buffer incomplete SSE lines that span across multiple chunks
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last (possibly incomplete) line in the buffer for the next iteration
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        try {
          const parsed = JSON.parse(payload);
          if (parsed.success && parsed.data?.text) onText(parsed.data.text);
          if (parsed.success && parsed.data?.done) { onDone(); return; }
          if (!parsed.success && parsed.error) { onError(parsed.error.message || parsed.error); return; }
        } catch {}
      }
    }
    onDone();
  } catch (err) {
    onError(err.message);
  }
}
