import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Tags, AlertTriangle, ShoppingCart, Headphones, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SalesChart from "@/components/charts/sales-chart";
import type { DashboardMetrics, ProductWithStock, SaleWithItems } from "@shared/schema";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery<ProductWithStock[]>({
    queryKey: ["/api/dashboard/low-stock"],
  });

  const { data: recentSales, isLoading: recentSalesLoading } = useQuery<SaleWithItems[]>({
    queryKey: ["/api/dashboard/recent-sales"],
  });

  if (metricsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getProductIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "eletrônicos":
        return ShoppingCart;
      case "acessórios":
        return Headphones;
      case "informática":
        return Laptop;
      default:
        return Package;
    }
  };

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-400">Visão geral do seu negócio</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-dark-800 border-primary-500/30 hover:border-primary-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Vendas Hoje</p>
                  <p className="text-2xl font-bold text-primary-400">
                    R$ {metrics?.todaySales.toFixed(2) || "0,00"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent-400 mr-1" />
                <span className="text-accent-400">+{metrics?.salesGrowth || 0}%</span>
                <span className="text-gray-400 ml-2">vs ontem</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-secondary-400/30 hover:border-secondary-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Produtos Vendidos</p>
                  <p className="text-2xl font-bold text-secondary-400">
                    {metrics?.todayProductsSold || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent-400 mr-1" />
                <span className="text-accent-400">+8%</span>
                <span className="text-gray-400 ml-2">vs ontem</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-accent-400/30 hover:border-accent-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Estoque Total</p>
                  <p className="text-2xl font-bold text-accent-400">
                    {metrics?.totalStock || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-accent-400 to-accent-500 rounded-lg flex items-center justify-center">
                  <Package className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                <span className="text-red-400">{metrics?.stockGrowth || 0}%</span>
                <span className="text-gray-400 ml-2">vs semana passada</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Produtos Cadastrados</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {metrics?.totalProducts || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Tags className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent-400 mr-1" />
                <span className="text-accent-400">+2</span>
                <span className="text-gray-400 ml-2">novos esta semana</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Sales Chart */}
          <Card className="bg-dark-800 border-primary-500/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Vendas dos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart />
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card className="bg-dark-800 border-secondary-400/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Vendas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSalesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3 bg-dark-900/50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSales?.slice(0, 3).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="font-medium">{sale.customerName || "Cliente Anônimo"}</p>
                          <p className="text-gray-400 text-sm">{sale.items.length}x itens</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-accent-400">R$ {Number(sale.total).toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(sale.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!recentSales || recentSales.length === 0) && (
                    <p className="text-center text-gray-400 py-8">Nenhuma venda recente</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {!lowStockLoading && lowStockProducts && lowStockProducts.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <Card className="bg-dark-800 border-red-500/30">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-red-400 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Alertas de Estoque Baixo
                  </CardTitle>
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto">
                    {lowStockProducts.length} produtos
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockProducts.slice(0, 3).map((product) => {
                    const Icon = getProductIcon(product.category);
                    return (
                      <div key={product.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-red-400" />
                            <h4 className="font-medium">{product.name}</h4>
                          </div>
                          <span className="text-red-400 text-sm font-bold">{product.stock} unidades</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">Estoque mínimo: {product.minStock}</p>
                        <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                          Repor Estoque
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
