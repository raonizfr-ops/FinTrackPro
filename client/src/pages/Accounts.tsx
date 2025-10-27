import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus, Edit2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Accounts() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "checking" as any,
    balance: "0.00",
    currency: "BRL",
    description: "",
  });

  const { data: accounts, isLoading, refetch } = trpc.accounts.list.useQuery();

  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      setOpen(false);
      setFormData({
        name: "",
        type: "checking",
        balance: "0.00",
        currency: "BRL",
        description: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar conta: " + error.message);
    },
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Nome da conta é obrigatório");
      return;
    }
    createMutation.mutate(formData);
  };

  const totalBalance = accounts?.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance), 0) || 0;

  const accountTypeLabels: Record<string, string> = {
    checking: "Conta Corrente",
    savings: "Poupança",
    investment: "Investimento",
    credit_card: "Cartão de Crédito",
    other: "Outro",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas contas bancárias e investimentos
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta</DialogTitle>
                <DialogDescription>
                  Adicione uma nova conta financeira
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Conta</label>
                  <Input
                    placeholder="Ex: Minha Conta Corrente"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Saldo Inicial</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    placeholder="Descrição da conta (opcional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Conta"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Balance Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              R$ {totalBalance.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {accounts?.length || 0} conta(s) ativa(s)
            </p>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))
          ) : accounts && accounts.length > 0 ? (
            accounts.map((account: any) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{account.name}</CardTitle>
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
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">
                      {accountTypeLabels[account.type] || account.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-bold">
                      R$ {parseFloat(account.balance).toFixed(2)}
                    </p>
                  </div>
                  {account.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conta criada</p>
              <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
                Criar Primeira Conta
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

