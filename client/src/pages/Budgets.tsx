import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Budgets() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [formData, setFormData] = useState({
    categoryId: "",
    limit: "",
    alertThreshold: "80",
  });

  const resetForm = () => {
    setFormData({
      categoryId: "",
      limit: "",
      alertThreshold: "80",
    });
  };

  const { data: budgets, isLoading, refetch } = trpc.budgets.getByMonth.useQuery({ month: currentMonth });
  const { data: categories } = trpc.categories.list.useQuery();

  const createMutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso!");
      setOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar orçamento: " + error.message);
    },
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.limit) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createMutation.mutate({
      categoryId: parseInt(formData.categoryId),
      limit: formData.limit,
      month: currentMonth,
      alertThreshold: parseInt(formData.alertThreshold),
    });
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "danger";
    if (percentage >= 80) return "warning";
    return "success";
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground mt-2">
              Defina e monitore seus limites de gastos
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Orçamento</DialogTitle>
                <DialogDescription>
                  Defina um limite de gastos para uma categoria
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Limite Mensal</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Alerta em (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Orçamento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budgets List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : budgets && budgets.length > 0 ? (
            budgets.map((budget: any) => {
              const status = getBudgetStatus(parseFloat(budget.spent), parseFloat(budget.limit));
              const percentage = (parseFloat(budget.spent) / parseFloat(budget.limit)) * 100;
              const categoryName = categories?.find((c: any) => c.id === budget.categoryId)?.name || "Categoria";

              return (
                <Card key={budget.id} className={status === "danger" ? "border-red-200" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>{categoryName}</CardTitle>
                      <CardDescription>
                        Limite: R$ {parseFloat(budget.limit).toFixed(2)}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Gasto: R$ {parseFloat(budget.spent).toFixed(2)}
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressColor(status)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {status === "danger" && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm text-red-600">
                          Você excedeu o orçamento desta categoria!
                        </p>
                      </div>
                    )}

                    {status === "warning" && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-600">
                          Você está próximo do limite desta categoria
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum orçamento criado para este mês</p>
              <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
                Criar Primeiro Orçamento
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

