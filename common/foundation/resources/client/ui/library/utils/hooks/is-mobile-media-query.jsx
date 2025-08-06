import { useMediaQuery } from '@ui/utils/hooks/use-media-query';
export function useIsMobileMediaQuery(options) {
  return useMediaQuery('(max-width: 768px)', options);
}