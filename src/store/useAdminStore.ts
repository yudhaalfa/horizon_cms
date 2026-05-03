import { useGlobalData, DataState, AdminActions } from './useGlobalData';

type AdminStore = DataState & AdminActions;

export const useAdminStore = <T>(selector: (state: AdminStore) => T): T => {
  return useGlobalData(selector as any);
};
