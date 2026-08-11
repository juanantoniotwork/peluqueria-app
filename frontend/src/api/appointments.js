import client from './client';

export function listAppointments(params) {
  return client.get('/appointments', { params }).then((res) => res.data);
}

export function createAppointment(data) {
  return client.post('/appointments', data).then((res) => res.data);
}

export function updateAppointment(id, data) {
  return client.put(`/appointments/${id}`, data).then((res) => res.data);
}

export function deleteAppointment(id) {
  return client.delete(`/appointments/${id}`);
}
