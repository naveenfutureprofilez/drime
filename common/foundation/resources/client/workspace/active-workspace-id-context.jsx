import React, { useContext, useEffect, useMemo } from 'react';
import { PersonalWorkspace, useUserWorkspaces } from './user-workspaces';
import { setActiveWorkspaceId } from './active-workspace-id';
import { useCookie } from '@ui/utils/hooks/use-cookie';
// add default context value so it does not error out, if there's no context provider
export const ActiveWorkspaceIdContext = React.createContext({
  // set default as null, so it's not sent via query params in admin and
  // other places if component is not wrapped in workspace context explicitly
  workspaceId: null,
  setWorkspaceId: () => {}
});
export function useActiveWorkspaceId() {
  return useContext(ActiveWorkspaceIdContext);
}
export function useActiveWorkspace() {
  const {
    workspaceId
  } = useActiveWorkspaceId();
  const query = useUserWorkspaces();
  if (query.data) {
    return query.data.find(workspace => workspace.id === workspaceId);
  }
  return null;
}
export function ActiveWorkspaceProvider({
  children
}) {
  const [workspaceId, setCookieId] = useCookie('activeWorkspaceId', `${PersonalWorkspace.id}`);
  useEffect(() => {
    setActiveWorkspaceId(parseInt(workspaceId));
    // clear workspace id when unmounting workspace provider
    return () => {
      setActiveWorkspaceId(0);
    };
  }, [workspaceId]);
  const contextValue = useMemo(() => {
    return {
      workspaceId: parseInt(workspaceId),
      setWorkspaceId: id => {
        setCookieId(`${id}`);
      }
    };
  }, [workspaceId, setCookieId]);
  return <ActiveWorkspaceIdContext.Provider value={contextValue}>
      {children}
    </ActiveWorkspaceIdContext.Provider>;
}