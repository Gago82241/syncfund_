import { useCallback, useEffect, useState } from 'react';
import { sharedProjectService } from '../services/sharedProjectService';
import type { SharedProjectResponse } from '../../../types/api';

export function useSharedProjects(userId: number) {
  const [projects, setProjects] = useState<SharedProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await sharedProjectService.getByMember(userId);
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projects, loading, refresh };
}
