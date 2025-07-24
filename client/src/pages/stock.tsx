import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, TrendingUp, TrendingDown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, StockMovement } from "@shared/schema";

export default function Stock() {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [movementType, setMovementType] = useState("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: stockMovements, isLoading } = useQuery<StockMovement[]>({
    queryKey: ["/api/stock-movements"],
  });

  const createMovementMutation = useMutation({
    mutationFn: async (data: { productId: string; type: string; quantity: number; reason?: string }) => {
      await apiRequest("POST", "/api/stock-movements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setSelectedProductId("");
      setQuantity("");
      setReason("");
      toast({
        title: "Movimentação registrada",
        description: "A movimentação de estoque foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar a movimentação.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || !quantity) {
      toast({
        title: "Erro",
        description: "Selecione um produto e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }

    createMovementMutation.mutate({
      productId: selectedProductId,
      type: movementType,
      quantity: parseInt(quantity),
      reason: reason || undefined,
    });
  };

  const getProductName = (productId: string) => {
    return products?.find((p) => p.id === productId)?.name || "Produto não encontrado";
  };

  const getCategoryIcon = (productId: String) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return "📦";

    switch (product.category.toLowerCase()) {
      case "eletrônicos":
        return "📱";
      case "acessórios":
        return "🎧";
      case "informática":
        return "💻";
      default:
        return "📦";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-1/4"></div>
          <div className="h-64 bg-dark-800 rounded-xl"></div>
          <div className="h-96 bg-dark-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Controle de Estoque</h2>
          <p className="text-gray-400">Gerencie entradas e saídas de produtos</p>
        </div>

        {/* Stock Movement Form */}
        <Card className="bg-dark-800 border-accent-400/30 mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold">Movimentação de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="product" className="text-gray-300">
                  Produto
                </Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="bg-dark-900 border-gray-600 focus:border-accent-400">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} (Estoque: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type" className="text-gray-300">
                  Tipo
                </Label>
                <Select value={movementType} onValueChange={setMovementType}>
                  <SelectTrigger className="bg-dark-900 border-gray-600 focus:border-accent-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrada</SelectItem>
                    <SelectItem value="out">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-gray-300">
                  Quantidade
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-dark-900 border-gray-600 focus:border-accent-400"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600"
                  disabled={createMovementMutation.isPending}
                >
                  {createMovementMutation.isPending ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </form>

            {/* Reason field - optional */}
            <div className="mt-4">
              <Label htmlFor="reason" className="text-gray-300">
                Motivo (Opcional)
              </Label>
              <Input
                id="reason"
                placeholder="Motivo da movimentação"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-dark-900 border-gray-600 focus:border-accent-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stock History */}
        <Card className="bg-dark-800 border-primary-500/30">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl font-semibold">Histórico de Movimentações</CardTitle>
              <Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Produto</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Quantidade</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Estoque Anterior</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Estoque Atual</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements?.map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-gray-800 hover:bg-dark-900/30 transition-colors duration-300"
                    >
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(movement.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getCategoryIcon(movement.productId)}</span>
                          <span>{getProductName(movement.productId)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={movement.type === "in" ? "default" : "destructive"}
                          className={
                            movement.type === "in" ? "bg-accent-500/20 text-accent-400" : "bg-red-500/20 text-red-400"
                          }
                        >
                          {movement.type === "in" ? (
                            <>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Entrada
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Saída
                            </>
                          )}
                        </Badge>
                      </td>
                      <td
                        className={`py-4 px-4 font-semibold ${
                          movement.type === "in" ? "text-accent-400" : "text-red-400"
                        }`}
                      >
                        {movement.type === "in" ? "+" : "-"}
                        {movement.quantity}
                      </td>
                      <td className="py-4 px-4 text-gray-400">{movement.previousStock}</td>
                      <td
                        className={`py-4 px-4 font-semibold ${
                          movement.type === "in" ? "text-secondary-400" : "text-yellow-400"
                        }`}
                      >
                        {movement.newStock}
                      </td>
                      <td className="py-4 px-4 text-gray-400">{movement.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!stockMovements || stockMovements.length === 0) && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-400 mb-2">Nenhuma movimentação encontrada</p>
                  <p className="text-gray-500">As movimentações de estoque aparecerão aqui</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
