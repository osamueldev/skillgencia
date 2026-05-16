import { createPocketBase } from '$lib/server/pocketbase';
import { initScheduler } from '$lib/server/scheduler';
import type { Handle } from '@sveltejs/kit';

let schedulerStarted = false;

export const handle: Handle = async ({ event, resolve }) => {
  if (!schedulerStarted) {
    schedulerStarted = true;
    initScheduler();
  }

  event.locals.pb = createPocketBase();
  event.locals.user = null;

  const token = event.cookies.get('pb_token');
  const model = event.cookies.get('pb_model');

  if (token && model) {
    try {
      event.locals.pb.authStore.save(token, JSON.parse(model));
      if (event.locals.pb.authStore.isValid) {
        await event.locals.pb.collection('users').authRefresh();
        event.locals.user = event.locals.pb.authStore.record;
      }
    } catch {
      event.locals.pb.authStore.clear();
      event.cookies.delete('pb_token', { path: '/' });
      event.cookies.delete('pb_model', { path: '/' });
    }
  }

  return resolve(event);
};
