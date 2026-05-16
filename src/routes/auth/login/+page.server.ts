import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, '/dashboard');
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString() ?? '';
    const password = data.get('password')?.toString() ?? '';

    if (!email || !password) {
      return fail(400, { error: 'Email e senha obrigatórios' });
    }

    try {
      const auth = await locals.pb.collection('users').authWithPassword(email, password);
      const cookieOpts = {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 30
      };
      cookies.set('pb_token', auth.token, cookieOpts);
      cookies.set('pb_model', JSON.stringify(auth.record), cookieOpts);
    } catch {
      return fail(400, { error: 'Credenciais inválidas' });
    }

    redirect(302, '/dashboard');
  }
};
