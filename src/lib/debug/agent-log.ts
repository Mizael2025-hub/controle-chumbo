type AgentLogPayload = {
  location: string
  message: string
  data?: Record<string, unknown>
  hypothesisId?: string
  runId?: string
  sessionId?: string
}

/** Log de debug da sessão — POST same-origin para funcionar no celular físico */
export function agentLog(payload: AgentLogPayload) {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  const body = {
    sessionId: payload.sessionId ?? '8315e2',
    timestamp: Date.now(),
    ...payload,
  }

  fetch('/api/debug-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})

  fetch('http://127.0.0.1:7622/ingest/84850b89-18d7-41bb-9510-1c5a775fc6b2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': body.sessionId,
    },
    body: JSON.stringify(body),
  }).catch(() => {})
}
