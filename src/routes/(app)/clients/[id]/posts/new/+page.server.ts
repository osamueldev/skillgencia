import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const connections = await locals.pb.collection('meta_connections').getList(1, 10, {
    filter: locals.pb.filter('client = {:id}', { id: params.id }),
    requestKey: null
  });
  return { connections: connections.items };
};

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const data = await request.formData();
    const platform = data.get('platform')?.toString();
    const content = data.get('content')?.toString() ?? '';
    const scheduleMode = data.get('schedule_mode')?.toString();
    const scheduledAt = data.get('scheduled_at')?.toString();

    if (!platform) return fail(400, { error: 'Plataforma é obrigatória' });
    if (!content.trim()) return fail(400, { error: 'Legenda é obrigatória' });

    const status = scheduleMode === 'schedule' && scheduledAt ? 'scheduled' : 'draft';

    try {
      const formData = new FormData();
      formData.set('client', params.id);
      formData.set('platform', platform);
      formData.set('content', content);
      formData.set('status', status);
      formData.set('created_by', locals.user!.id);
      if (status === 'scheduled') formData.set('scheduled_at', scheduledAt!);

      const mediaFiles = data.getAll('media') as File[];
      for (const file of mediaFiles) {
        if (file.size > 0) formData.append('media', file);
      }

      await locals.pb.collection('posts').create(formData);
      redirect(302, `/clients/${params.id}/posts`);
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Erro ao criar post' });
    }
  }
};
