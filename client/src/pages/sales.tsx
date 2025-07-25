import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, ShoppingCart, Eye, Printer, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, SaleWithItems } from "@shared/schema";
import { useLocation } from "wouter";

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export default function Sales() {
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [selectedDiscount, setSelectedDiscount] = useState("0");
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [location] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("productID");

    if (productId) {
      setSelectedProductId(productId);
    }
  }, [location]);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: sales, isLoading } = useQuery<SaleWithItems[]>({
    queryKey: ["/api/sales"],
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      clearSale();
      toast({
        title: "Venda finalizada",
        description: "A venda foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível finalizar a venda.",
        variant: "destructive",
      });
    },
  });

  const addProductToCart = () => {
    if (!selectedProductId || !selectedQuantity) {
      toast({
        title: "Erro",
        description: "Selecione um produto e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }

    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (product.stock < parseInt(selectedQuantity)) {
      toast({
        title: "Erro",
        description: "Quantidade indisponível em estoque.",
        variant: "destructive",
      });
      return;
    }

    // Check if product is already in cart
    const existingItemIndex = cartItems.findIndex((item) => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...cartItems];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + parseInt(selectedQuantity);

      if (newQuantity > product.stock) {
        toast({
          title: "Erro",
          description: "Quantidade total excede o estoque disponível.",
          variant: "destructive",
        });
        return;
      }

      const unitPrice = Number(product.price);
      const discount = Number(selectedDiscount);
      const subtotal = unitPrice * newQuantity * (1 - discount / 100);

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        discount,
        subtotal,
      };

      setCartItems(updatedItems);
    } else {
      // Add new item
      const unitPrice = Number(product.price);
      const quantity = parseInt(selectedQuantity);
      const discount = Number(selectedDiscount);
      const subtotal = unitPrice * quantity * (1 - discount / 100);

      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        discount,
        subtotal,
      };

      setCartItems([...cartItems, newItem]);
    }

    setSelectedProductId("");
    setSelectedQuantity("1");
    setSelectedDiscount("0");
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const clearSale = () => {
    setCustomerName("");
    setPaymentMethod("cash");
    setCartItems([]);
  };

  const completeSale = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione produtos à venda.",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      customerName: customerName || undefined,
      paymentMethod,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
    };

    createSaleMutation.mutate(saleData);
  };

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; color: string }> = {
      cash: { label: "Dinheiro", color: "bg-green-500/20 text-green-400" },
      debit: { label: "Débito", color: "bg-blue-500/20 text-blue-400" },
      credit: { label: "Crédito", color: "bg-purple-500/20 text-purple-400" },
      pix: { label: "PIX", color: "bg-primary-500/20 text-primary-400" },
    };

    return methods[method] || { label: method, color: "bg-gray-500/20 text-gray-400" };
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Vendas</h2>
          <p className="text-gray-400">Registre e acompanhe suas vendas</p>
        </div>

        {/* New Sale Form */}
        <Card className="bg-dark-800 border-primary-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Nova Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer" className="text-gray-300">
                  Cliente (Opcional)
                </Label>
                <Input
                  id="customer"
                  placeholder="Nome do cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-dark-900 border-gray-600 focus:border-primary-400"
                />
              </div>
              <div>
                <Label htmlFor="payment" className="text-gray-300">
                  Método de Pagamento
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-dark-900 border-gray-600 focus:border-primary-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="product-select" className="text-gray-300 text-sm mb-2 block">
                    Produto
                  </Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger id="product-select" className="bg-dark-900 border-gray-600 focus:border-primary-400">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        ?.filter((p) => p.stock > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - R$ {Number(product.price).toLocaleString("BRL")}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity-input" className="text-gray-300 text-sm mb-2 block">
                    Quantidade
                  </Label>
                  <Input
                    id="quantity-input"
                    type="number"
                    min="1"
                    placeholder="Quantidade"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    className="bg-dark-900 border-gray-600 focus:border-primary-400"
                  />
                </div>

                <div>
                  <Label htmlFor="discount-input" className="text-gray-300 text-sm mb-2 block">
                    Desconto (Opcional)
                  </Label>
                  <Input
                    id="discount-input"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Desconto %"
                    value={selectedDiscount}
                    onChange={(e) => setSelectedDiscount(e.target.value)}
                    className="bg-dark-900 border-gray-600 focus:border-primary-400"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addProductToCart}
                    className="w-full bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected Products */}
            <div className="bg-dark-900/50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Produtos Selecionados</h4>
              {cartItems.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhum produto adicionado</p>
              ) : (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-dark-800 rounded-lg gap-3"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-xl">📦</span>
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-gray-400 text-sm">
                            {item.quantity}x unidades - R$ {Number(item.unitPrice).toLocaleString("BRL")} cada
                            {item.discount > 0 && ` (${item.discount}% desc.)`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <span className="font-semibold text-accent-400">R$ {item.subtotal.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-accent-400">R$ {getTotalAmount().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={clearSale}
                className="flex-1 border-gray-600 hover:border-gray-500"
              >
                Limpar
              </Button>
              <Button
                type="button"
                onClick={completeSale}
                disabled={createSaleMutation.isPending || cartItems.length === 0}
                className="flex-1 bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {createSaleMutation.isPending ? "Finalizando..." : "Finalizar Venda"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card className="bg-dark-800 border-secondary-400/30">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl font-semibold">Histórico de Vendas</CardTitle>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Input type="date" className="bg-dark-900 border-gray-600 focus:border-secondary-400" />
                <Button className="bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Itens</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Pagamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale) => {
                    const paymentBadge = getPaymentMethodBadge(sale.paymentMethod);
                    return (
                      <tr
                        key={sale.id}
                        className="border-b border-gray-800 hover:bg-dark-900/30 transition-colors duration-300"
                      >
                        <td className="py-4 px-4 text-gray-300">{new Date(sale.createdAt).toLocaleString("pt-BR")}</td>
                        <td className="py-4 px-4">{sale.customerName || "Cliente Anônimo"}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{sale.items.length}x produtos</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={paymentBadge.color}>{paymentBadge.label}</Badge>
                        </td>
                        <td className="py-4 px-4 text-accent-400 font-semibold">R$ {Number(sale.total).toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-secondary-400 hover:text-secondary-300">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(!sales || sales.length === 0) && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-400 mb-2">Nenhuma venda encontrada</p>
                  <p className="text-gray-500">As vendas realizadas aparecerão aqui</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
