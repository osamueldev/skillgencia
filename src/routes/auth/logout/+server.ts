import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
  locals.pb.authStore.clear();
  cookies.delete('pb_token', { path: '/' });
  cookies.delete('pb_model', { path: '/' });
  redirect(302, '/auth/login');
};
