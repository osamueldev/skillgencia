import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
  try {
    const client = await locals.pb.collection('clients').getOne(params.id);
    return { client };
  } catch {
    error(404, 'Cliente não encontrado');
  }
};
