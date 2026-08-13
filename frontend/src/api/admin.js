import client from './client';

export function listBusinesses() {
  return client.get('/admin/businesses').then((res) => res.data);
}
