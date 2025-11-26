import { useState, useEffect, createContext, useContext } from "react";

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
  const [adminPassword, setAdminPasswordState] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
    if (stored) {
      setAdminPasswordState(stored);
    }
  }, []);

  const setAdminPassword = (password: string) => {
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
    setAdminPasswordState(password);
  };

  const clearAdminPassword = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAdminPasswordState(null);
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (adminPassword) {
      return { "x-admin-password": adminPassword };
    }
    return {};
  };

  return (
    <AdminPasswordContext.Provider
      value={{
        adminPassword,
        setAdminPassword,
        clearAdminPassword,
        isAdminAuthenticated: !!adminPassword,
        getAuthHeaders,
      }}
    >
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
