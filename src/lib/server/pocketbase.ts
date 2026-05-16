import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from '$env/static/private';

export function createPocketBase() {
  return new PocketBase(POCKETBASE_URL);
}
