import { auth, useAuth } from '../use-auth';
import { Navigate, Outlet, replace } from 'react-router';
export function SubscribedRoute({
  children
}) {
  const {
    isSubscribed
  } = useAuth();
  if (!isSubscribed) {
    return <Navigate to="/pricing" replace />;
  }
  return children || <Outlet />;
}
export function subscribedGuard() {
  if (!auth.isSubscribed) {
    return replace('/pricing');
  }
  return null;
}