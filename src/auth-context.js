import { createContext, useContext } from 'react';

// Kept in a component-free module on purpose: a file that exports both a
// component and a hook breaks React Fast Refresh, so AuthProvider lives in
// App.jsx and only the context + hook live here.
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
