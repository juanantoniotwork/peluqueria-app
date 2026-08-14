import client from './client';

export function listBusinesses() {
  return client.get('/admin/businesses').then((res) => res.data);
}

export function deleteBusiness(id, confirmName) {
  return client
    .delete(`/admin/businesses/${id}`, { data: { confirmName } })
    .then((res) => res.data);
}
