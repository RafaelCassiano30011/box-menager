import { Link, useLocation } from "wouter";
import { BarChart3, Package, Warehouse, ShoppingCart, FileText } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Estoque", href: "/stock", icon: Warehouse },
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-dark-800 border-r border-primary-500/20 flex flex-col">
      <div className="p-6 border-b border-primary-500/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
          CashFlow Pro
        </h1>
        <p className="text-gray-400 text-sm mt-1">Controle de Caixa</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-300
                  ${isActive
                    ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30 text-primary-400"
                    : "hover:bg-gradient-to-r hover:from-secondary-400/20 hover:to-secondary-500/10 hover:border hover:border-secondary-400/30 text-gray-300 hover:text-secondary-400"
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">A</span>
          </div>
          <div>
            <p className="font-medium text-sm">Admin User</p>
            <p className="text-gray-400 text-xs">admin@cashflow.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
