import { auth, useAuth } from '../use-auth';
import { Navigate, Outlet, replace } from 'react-router';
export function NotSubscribedRoute({
  children
}) {
  const {
    isLoggedIn,
    isSubscribed
  } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/register" replace />;
  }
  if (isLoggedIn && isSubscribed) {
    return <Navigate to="/billing" replace />;
  }
  return children || <Outlet />;
}
export function notSubscribedGuard() {
  if (!auth.isLoggedIn) {
    return replace('/register');
  }
  if (auth.isLoggedIn && auth.isSubscribed) {
    return replace('/billing');
  }
  return null;
}