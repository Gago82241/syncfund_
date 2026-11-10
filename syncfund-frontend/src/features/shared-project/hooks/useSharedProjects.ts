import { useCallback, useEffect, useState } from 'react';
import { sharedProjectService } from '../services/sharedProjectService';
import type { SharedProjectResponse } from '../../../types/api';

export function useSharedProjects(userId: number) {
  const [projects, setProjects] = useState<SharedProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(
    () =>
      sharedProjectService
        .getByMember(userId)
        .then(({ data }) => setProjects(data))
        .finally(() => setLoading(false)),
    [userId],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, refresh };
}
