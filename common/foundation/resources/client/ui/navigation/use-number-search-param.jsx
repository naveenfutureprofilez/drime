import { useSearchParams } from 'react-router';
export function useNumberSearchParam(name) {
  const [searchParams] = useSearchParams();
  const value = searchParams.get(name);
  return value ? +value : null;
}