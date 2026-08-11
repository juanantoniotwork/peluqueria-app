import client from './client';

export function register(data) {
  return client.post('/auth/register', data).then((res) => res.data);
}

export function login(data) {
  return client.post('/auth/login', data).then((res) => res.data);
}
