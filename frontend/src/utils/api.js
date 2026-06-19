import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const isAdminPath = window.location.pathname.startsWith('/admin')
  const token = isAdminPath ? localStorage.getItem('admin_token') : localStorage.getItem('customer_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api