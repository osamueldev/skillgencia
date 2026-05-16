import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({});

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString() ?? '';
    const slug = data.get('slug')?.toString() ?? '';

    if (!name || !slug) {
      return fail(400, { error: 'Nome e slug são obrigatórios' });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return fail(400, { error: 'Slug deve conter apenas letras minúsculas, números e hífens' });
    }

    let clientId: string;
    try {
      const client = await locals.pb.collection('clients').create({
        name,
        slug,
        brand_colors: { primary: data.get('primary_color') || '#6366f1', secondary: '#e0e7ff', accent: '#4f46e5' },
        brand_fonts: { heading: 'Inter', body: 'Inter' },
        created_by: locals.user?.id
      });
      clientId = client.id;
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Erro ao criar cliente' });
    }
    redirect(302, `/clients/${clientId}/posts`);
  }
};
