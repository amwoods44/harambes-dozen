import type { ViewerSession } from '../App';

export function viewerSessionFromSearch(search: string, allowPreview: boolean): ViewerSession {
  if (!allowPreview) return { kind: 'public' };

  const params = new URLSearchParams(search);
  if (params.get('public') === '1') return { kind: 'public' };

  const previewUser = params.get('as')?.trim();
  return previewUser
    ? { kind: 'member', userId: previewUser }
    : { kind: 'member', userId: '393634863552425984' };
}
