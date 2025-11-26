import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";

interface AdminPasswordContextType {
  adminPassword: string | null;
  setAdminPassword: (password: string) => void;
  clearAdminPassword: () => void;
  isAdminAuthenticated: boolean;
  getAuthHeaders: () => Record<string, string>;
}

const AdminPasswordContext = createContext<AdminPasswordContextType | null>(null);

const ADMIN_PASSWORD_KEY = "tburn_admin_password";

export function AdminPasswordProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [adminPassword, setAdminPasswordState] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_PASSWORD_KEY);
  });

  const setAdminPassword = useCallback((password: string) => {
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
    setAdminPasswordState(password);
  }, []);

  const clearAdminPassword = useCallback(() => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAdminPasswordState(null);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (adminPassword) {
      return { "x-admin-password": adminPassword };
    }
    return {};
  }, [adminPassword]);

  const contextValue = useMemo(() => ({
    adminPassword,
    setAdminPassword,
    clearAdminPassword,
    isAdminAuthenticated: !!adminPassword,
    getAuthHeaders,
  }), [adminPassword, setAdminPassword, clearAdminPassword, getAuthHeaders]);

  return (
    <AdminPasswordContext.Provider value={contextValue}>
      {children}
    </AdminPasswordContext.Provider>
  );
}

export function useAdminPassword() {
  const context = useContext(AdminPasswordContext);
  if (!context) {
    throw new Error("useAdminPassword must be used within an AdminPasswordProvider");
  }
  return context;
}
