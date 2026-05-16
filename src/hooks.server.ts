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
      const parsedModel = JSON.parse(model);
      event.locals.pb.authStore.save(token, parsedModel);
      event.locals.user = parsedModel;
    } catch {
      event.cookies.delete('pb_token', { path: '/' });
      event.cookies.delete('pb_model', { path: '/' });
    }
  }

  return resolve(event);
};
