import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, AlertTriangle, LogOut, Loader2 } from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";

interface OperatorAuthGuardProps {
  children: React.ReactNode;
}

export function OperatorAuthGuard({ children }: OperatorAuthGuardProps) {
  const { t } = useTranslation();
  const { isAdminAuthenticated, setAdminPassword, clearAdminPassword, getAuthHeaders, adminPassword } = useAdminPassword();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const hasValidated = useRef(false);
  const lastValidatedPassword = useRef<string | null>(null);

  useEffect(() => {
    if (hasValidated.current && lastValidatedPassword.current === adminPassword) {
      return;
    }

    const validateStoredSession = async () => {
      if (!adminPassword) {
        setIsValidating(false);
        setIsValidSession(false);
        return;
      }

      try {
        const response = await fetch("/api/operator/dashboard", {
          headers: { "x-admin-password": adminPassword },
        });

        if (response.ok) {
          setIsValidSession(true);
          hasValidated.current = true;
          lastValidatedPassword.current = adminPassword;
        } else {
          clearAdminPassword();
          setIsValidSession(false);
        }
      } catch {
        clearAdminPassword();
        setIsValidSession(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateStoredSession();
  }, [adminPassword, clearAdminPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/operator/dashboard", {
        headers: {
          "x-admin-password": password,
        },
      });

      if (response.ok) {
        setAdminPassword(password);
        setIsValidSession(true);
        setPassword("");
      } else {
        setError(t('operator.auth.invalidPassword'));
      }
    } catch (err) {
      setError(t('operator.auth.verificationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminPassword();
    setIsValidSession(false);
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('operator.auth.validatingSession')}</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated || !isValidSession) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t('operator.auth.portalAccess')}</CardTitle>
            <CardDescription>
              {t('operator.auth.enterPassword')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">{t('operator.auth.adminPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('operator.auth.passwordPlaceholder')}
                    className="pl-10"
                    autoFocus
                    data-testid="input-admin-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password}
                data-testid="btn-admin-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('operator.auth.verifying')}
                  </>
                ) : (
                  t('operator.auth.accessPortal')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
          data-testid="btn-admin-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('operator.logout')}
        </Button>
      </div>
      {children}
    </div>
  );
}
