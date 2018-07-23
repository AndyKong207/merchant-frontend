import request from '../utils/request';

export function query() {
  return request('/api/merchant')
}

export function queryById(id) {
  return request(`/api/merchant/${id}`)
}