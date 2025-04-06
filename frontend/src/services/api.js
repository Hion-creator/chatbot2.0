const BASE_URL = 'http://127.0.0.1:8000'

function getToken() {
  return localStorage.getItem('token')
}

export async function login(credentials) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  if (!res.ok) throw new Error('Error en login')
  return res.json()
}

export async function uploadPDF(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/data/upload_pdf`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  })
  if (!res.ok) throw new Error('Error subiendo PDF')
  return res.json()
}

export async function getMetrics() {
  const res = await fetch(`${BASE_URL}/onboarding/metrics`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  if (!res.ok) throw new Error('Error obteniendo métricas')
  return res.json()
}

export async function getEmployees() {
  const res = await fetch(`${BASE_URL}/onboarding/employees`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  if (!res.ok) throw new Error('Error obteniendo empleados')
  return res.json()
}

export async function requestOnboarding(data) {
  const res = await fetch(`${BASE_URL}/onboarding/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Error solicitando onboarding')
  return res.json()
}

export async function confirmOnboarding(data) {
  const res = await fetch(`${BASE_URL}/onboarding/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Error confirmando onboarding')
  return res.json()
}

export async function evaluateOnboarding(data) {
  const res = await fetch(`${BASE_URL}/onboarding/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Error evaluando onboarding')
  return res.json()
}

export async function submitAnswers(data) {
  const res = await fetch(`${BASE_URL}/onboarding/submitAnswers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Error enviando respuestas')
  return res.json()
}

// Endpoints para consultas:
export async function getGeneralQuery(params) {
  const queryParam = new URLSearchParams({ query: params.query }).toString()
  const res = await fetch(`${BASE_URL}/onboarding/general-query?${queryParam}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  if (!res.ok) throw new Error('Error obteniendo respuesta general')
  return res.json()
}

export async function getTaskQuery(params) {
  const queryParam = new URLSearchParams({
    employee_name: params.employee_name,
    task_index: params.task_index,
    query: params.query
  }).toString()
  const res = await fetch(`${BASE_URL}/onboarding/task-query?${queryParam}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  if (!res.ok) throw new Error('Error obteniendo respuesta de tarea')
  return res.json()
}

