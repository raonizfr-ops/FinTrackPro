import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Goals() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    deadline: "",
    category: "",
  });

  const { data: goals, isLoading, refetch } = trpc.goals.list.useQuery();

  const createMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("Meta criada com sucesso!");
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        targetAmount: "",
        deadline: "",
        category: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar meta: " + error.message);
    },
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createMutation.mutate({
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
    });
  };

  const completedGoals = goals?.filter((g: any) => g.isCompleted) || [];
  const activeGoals = goals?.filter((g: any) => !g.isCompleted) || [];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
            <p className="text-muted-foreground mt-2">
              Defina e acompanhe seus objetivos financeiros
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Meta Financeira</DialogTitle>
                <DialogDescription>
                  Defina um objetivo financeiro para alcançar
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Meta</label>
                  <Input
                    placeholder="Ex: Fundo de Emergência"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    placeholder="Descrição da meta (opcional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Valor Alvo</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Data Limite</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Input
                    placeholder="Ex: Viagem, Casa, Carro"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Meta"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Metas Ativas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))
              ) : (
                activeGoals.map((goal: any) => {
                  const progress = getProgressPercentage(
                    parseFloat(goal.currentAmount),
                    parseFloat(goal.targetAmount)
                  );
                  const daysLeft = goal.deadline
                    ? Math.ceil(
                        (new Date(goal.deadline).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null;

                  return (
                    <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{goal.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">
                            {goal.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Progresso</span>
                            <span className="text-sm font-medium">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Acumulado</p>
                            <p className="font-semibold">
                              R$ {parseFloat(goal.currentAmount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Meta</p>
                            <p className="font-semibold">
                              R$ {parseFloat(goal.targetAmount).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {daysLeft !== null && (
                          <div className="text-xs text-muted-foreground">
                            {daysLeft > 0
                              ? `${daysLeft} dias restantes`
                              : "Prazo expirado"}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Metas Concluídas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal: any) => (
                <Card key={goal.id} className="opacity-75">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      {goal.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Meta de R$ {parseFloat(goal.targetAmount).toFixed(2)} atingida!
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals && goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma meta criada</p>
            <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
              Criar Primeira Meta
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

