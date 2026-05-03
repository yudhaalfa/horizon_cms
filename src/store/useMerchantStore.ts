import { useGlobalData, DataState, MerchantActions } from './useGlobalData';

type MerchantStore = DataState & MerchantActions;

export const useMerchantStore = <T>(
  selector: (state: MerchantStore) => T,
): T => {
  return useGlobalData(selector as any);
};
