import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bell, CheckCircle2, Info, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Notifications() {
  const { user } = useAuth();
  const { data: notifications, isLoading, refetch } = trpc.notifications.list.useQuery({});

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao marcar notificação como lida: " + error.message);
    },
  });

  if (!user) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "budget_alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "goal_reached":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "transaction_created":
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "budget_alert":
        return "bg-red-50 border-red-200";
      case "goal_reached":
        return "bg-green-50 border-green-200";
      case "transaction_created":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "budget_alert":
        return "Alerta de Orçamento";
      case "goal_reached":
        return "Meta Atingida";
      case "transaction_created":
        return "Transação Criada";
      default:
        return "Informação";
    }
  };

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
            <p className="text-muted-foreground mt-2">
              Você tem {unreadCount} notificação(ões) não lida(s)
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`${getNotificationColor(notification.type)} ${!notification.isRead ? "border-2" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {notification.title}
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 bg-background rounded">
                              {getTypeLabel(notification.type)}
                            </span>
                            {!notification.isRead && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                markAsReadMutation.mutate({ id: notification.id })
                              }
                              disabled={markAsReadMutation.isPending}
                            >
                              Marcar como lida
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
              <p className="text-sm text-muted-foreground mt-2">
                Você receberá notificações sobre alertas de orçamento e outras atividades
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

