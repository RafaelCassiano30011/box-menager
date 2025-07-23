import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SaleWithItems } from "@shared/schema";

interface ChartData {
  date: string;
  sales: number;
  revenue: number;
}

export default function SalesChart() {
  const { data: sales, isLoading } = useQuery<SaleWithItems[]>({
    queryKey: ["/api/sales"],
  });

  const processChartData = (): ChartData[] => {
    if (!sales) return [];

    // Get last 7 days
    const last7Days: ChartData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= date && saleDate < nextDay;
      });

      const dayRevenue = daySales.reduce((sum, sale) => sum + Number(sale.total), 0);
      const salesCount = daySales.length;

      last7Days.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        sales: salesCount,
        revenue: dayRevenue,
      });
    }

    return last7Days;
  };

  const chartData = processChartData();

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse bg-gradient-to-br from-primary-500/10 to-primary-600/20 rounded-lg w-full h-full flex items-center justify-center border border-primary-500/20">
          <p className="text-gray-400">Carregando gráfico...</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/20 rounded-lg w-full h-full flex items-center justify-center border border-primary-500/20">
          <p className="text-gray-400">Nenhum dado de vendas disponível</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-primary-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-primary-400 font-semibold">
              Vendas: {payload[0].value}
            </p>
            <p className="text-accent-400 font-semibold">
              Receita: R$ {payload[1]?.value?.toFixed(2) || '0,00'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(266, 85%, 58%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(266, 85%, 58%)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 3.7%, 15.9%)" />
          
          <XAxis 
            dataKey="date" 
            stroke="hsl(240, 5%, 64.9%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            stroke="hsl(240, 5%, 64.9%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            yAxisId="sales"
          />
          
          <YAxis 
            stroke="hsl(240, 5%, 64.9%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            orientation="right"
            yAxisId="revenue"
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="sales"
            stroke="hsl(266, 85%, 58%)"
            strokeWidth={2}
            fill="url(#salesGradient)"
            yAxisId="sales"
          />
          
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(166, 72%, 40%)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            yAxisId="revenue"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
