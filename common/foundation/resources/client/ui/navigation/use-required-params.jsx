import { useParams } from 'react-router';
export const useRequiredParams = requiredParamNames => {
  const routeParams = useParams();
  for (const paramName of requiredParamNames) {
    const parameter = routeParams[paramName];
    if (!parameter) {
      throw new Error(`This component should not be rendered on a route which does not have the ${paramName} parameter`);
    }
  }
  return routeParams;
};