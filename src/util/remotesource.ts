import { API, RemoteSourceResponse } from '../app/api';

export async function getAllRemoteSources(
  api: API
): Promise<RemoteSourceResponse[]> {
  const remoteSources: RemoteSourceResponse[] = [];
  let cursor: string | undefined;
  for (;;) {
    const { res, cursor: resCursor } = await api.getRemoteSources(cursor);

    remoteSources.push(...res);

    if (!resCursor) break;

    cursor = resCursor;
  }

  return remoteSources;
}
