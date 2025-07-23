import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BarChart3, Package, Warehouse, ShoppingCart, FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Estoque", href: "/stock", icon: Warehouse },
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
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
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-left
                  ${isActive
                    ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30 text-primary-400"
                    : "hover:bg-gradient-to-r hover:from-secondary-400/20 hover:to-secondary-500/10 hover:border hover:border-secondary-400/30 text-gray-300 hover:text-secondary-400"
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">A</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-sm">Admin User</p>
            <p className="text-gray-400 text-xs">admin@cashflow.com</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-dark-800 border-primary-500/30 text-primary-400 hover:bg-primary-500/10"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-dark-800 border-r border-primary-500/20 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed left-0 top-0 h-full w-72 sm:w-80 max-w-sm bg-dark-800 border-r border-primary-500/20 flex flex-col z-50 transform transition-transform duration-300 shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>
    </>
  );
}
