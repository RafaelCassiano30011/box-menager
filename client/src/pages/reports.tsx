import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Mail, TrendingUp, DollarSign, Package, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SalesChart from "@/components/charts/sales-chart";
import { generatePDFReport } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import type { SaleWithItems, Product } from "@shared/schema";

export default function Reports() {
  const [period, setPeriod] = useState("this-month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { toast } = useToast();

  const { data: sales } = useQuery<SaleWithItems[]>({
    queryKey: ["/api/sales"],
  });

  const { data: topProducts } = useQuery<Array<Product & { totalSold: number; totalRevenue: number }>>({
    queryKey: ["/api/reports/top-products"],
  });

  // Calculate metrics based on period
  const getFilteredSales = () => {
    if (!sales) return [];
    
    const now = new Date();
    let filterDate = new Date();
    
    switch (period) {
      case "this-month":
        filterDate.setMonth(now.getMonth());
        filterDate.setDate(1);
        break;
      case "last-month":
        filterDate.setMonth(now.getMonth() - 1);
        filterDate.setDate(1);
        break;
      case "last-3-months":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "this-year":
        filterDate.setMonth(0);
        filterDate.setDate(1);
        break;
      default:
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          return sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= start && saleDate <= end;
          });
        }
        return sales;
    }
    
    return sales.filter(sale => new Date(sale.createdAt) >= filterDate);
  };

  const filteredSales = getFilteredSales();
  
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalProducts = filteredSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const averageTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  const exportPDF = async () => {
    try {
      await generatePDFReport({
        period,
        startDate,
        endDate,
        totalRevenue,
        totalProducts,
        averageTicket,
        sales: filteredSales,
        topProducts: topProducts || []
      });
      
      toast({
        title: "Relatório gerado",
        description: "O relatório PDF foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    }
  };

  const exportExcel = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A exportação para Excel será implementada em breve.",
    });
  };

  const sendEmail = () => {
    toast({
      title: "Em desenvolvimento",
      description: "O envio por email será implementado em breve.",
    });
  };

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Relatórios</h2>
          <p className="text-gray-400">Análises e estatísticas do seu negócio</p>
        </div>

        {/* Report Filters */}
        <Card className="bg-dark-800 border-purple-500/30 mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="period" className="text-gray-300">Período</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="bg-dark-900 border-gray-600 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">Este Mês</SelectItem>
                    <SelectItem value="last-month">Último Mês</SelectItem>
                    <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
                    <SelectItem value="this-year">Este Ano</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start-date" className="text-gray-300">Data Início</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={period !== "custom"}
                  className="bg-dark-900 border-gray-600 focus:border-purple-400"
                />
              </div>
              
              <div>
                <Label htmlFor="end-date" className="text-gray-300">Data Fim</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={period !== "custom"}
                  className="bg-dark-900 border-gray-600 focus:border-purple-400"
                />
              </div>
              
              <div className="flex items-end">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-dark-800 border-primary-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Receita Total</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-primary-400 mb-2">R$ {totalRevenue.toFixed(2)}</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent-400 mr-1" />
                <span className="text-accent-400">+18%</span>
                <span className="text-gray-400 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-secondary-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Produtos Vendidos</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Package className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-secondary-400 mb-2">{totalProducts}</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent-400 mr-1" />
                <span className="text-accent-400">+12%</span>
                <span className="text-gray-400 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-accent-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ticket Médio</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-accent-400 to-accent-500 rounded-lg flex items-center justify-center">
                  <Receipt className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-accent-400 mb-2">R$ {averageTicket.toFixed(2)}</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent-400 mr-1" />
                <span className="text-accent-400">+5%</span>
                <span className="text-gray-400 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Sales Chart */}
          <Card className="bg-dark-800 border-primary-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Vendas do Período</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SalesChart />
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-dark-800 border-secondary-400/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Produtos Mais Vendidos</CardTitle>
                <Button variant="ghost" size="sm" className="text-secondary-400 hover:text-secondary-300">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts?.slice(0, 5).map((product, index) => {
                  const percentage = topProducts.length > 0 ? (product.totalSold / Math.max(...topProducts.map(p => p.totalSold))) * 100 : 0;
                  
                  return (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm">{product.totalSold} vendas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-accent-400">R$ {product.totalRevenue.toFixed(2)}</p>
                        <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-gradient-to-r from-secondary-400 to-secondary-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {(!topProducts || topProducts.length === 0) && (
                  <p className="text-center text-gray-400 py-8">Nenhum dado de vendas disponível</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="bg-dark-800 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Exportar Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={exportPDF}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 p-6 h-auto flex flex-col items-center space-y-2"
              >
                <FileText className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-semibold">Exportar PDF</p>
                  <p className="text-sm opacity-80">Relatório completo</p>
                </div>
              </Button>
              
              <Button
                onClick={exportExcel}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-6 h-auto flex flex-col items-center space-y-2"
              >
                <Download className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-semibold">Exportar Excel</p>
                  <p className="text-sm opacity-80">Dados tabulares</p>
                </div>
              </Button>
              
              <Button
                onClick={sendEmail}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-6 h-auto flex flex-col items-center space-y-2"
              >
                <Mail className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-semibold">Enviar por Email</p>
                  <p className="text-sm opacity-80">Relatório automático</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
