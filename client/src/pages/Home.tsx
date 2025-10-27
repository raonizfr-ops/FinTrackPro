import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        setLocation("/dashboard");
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="w-full max-w-md p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">FinTrackPro</h1>
            <p className="text-muted-foreground">
              Gerencie suas finanças pessoais com inteligência
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-2">💰 Rastreamento Completo</h3>
                <p className="text-sm text-muted-foreground">
                  Monitore todas as suas transações em um único lugar
                </p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-2">📊 Análises Detalhadas</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize seus gastos com gráficos e relatórios
                </p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-2">🎯 Orçamentos Inteligentes</h3>
                <p className="text-sm text-muted-foreground">
                  Defina limites e receba alertas quando se aproximar
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full"
          >
            Entrar com Manus
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao entrar, você concorda com nossos termos de serviço
          </p>
        </div>
      </div>
    );
  }

  return null;
}

