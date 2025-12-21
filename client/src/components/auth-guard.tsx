import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [location, setLocation] = useLocation();
  
  const { data: authData, isLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/auth/check"],
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const isAuthenticated = authData?.authenticated ?? false;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save the original URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", location);
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
