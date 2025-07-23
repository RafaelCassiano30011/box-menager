import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, ShoppingCart, Package2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ProductModal from "@/components/modals/product-modal";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "in-stock" && product.stock > 0) ||
                        (stockFilter === "low-stock" && product.stock <= product.minStock) ||
                        (stockFilter === "out-of-stock" && product.stock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = Array.from(new Set(products?.map(p => p.category) || []));

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const getStockBadgeColor = (product: Product) => {
    if (product.stock === 0) return "destructive";
    if (product.stock <= product.minStock) return "secondary";
    return "default";
  };

  const getStockText = (product: Product) => {
    if (product.stock === 0) return "Sem estoque";
    if (product.stock <= product.minStock) return "Estoque baixo";
    return "Em estoque";
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-dark-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Produtos</h2>
            <p className="text-gray-400">Gerencie seu catálogo de produtos</p>
          </div>
          <Button 
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-800 border-gray-600 focus:border-secondary-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-dark-800 border-gray-600 focus:border-secondary-400">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="bg-dark-800 border-gray-600 focus:border-secondary-400">
              <SelectValue placeholder="Todos os Estoques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estoques</SelectItem>
              <SelectItem value="in-stock">Em Estoque</SelectItem>
              <SelectItem value="low-stock">Estoque Baixo</SelectItem>
              <SelectItem value="out-of-stock">Sem Estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts?.map((product) => (
            <Card key={product.id} className="bg-dark-800 border-secondary-400/30 hover:border-secondary-400/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center text-xl">
                    {getCategoryIcon(product.category)}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="text-gray-400 hover:text-primary-400"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Preço:</span>
                    <span className="font-semibold text-accent-400">R$ {Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estoque:</span>
                    <span className={`font-semibold ${
                      product.stock === 0 ? 'text-red-400' : 
                      product.stock <= product.minStock ? 'text-yellow-400' : 
                      'text-secondary-400'
                    }`}>
                      {product.stock} unidades
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-400">Categoria:</span>
                    <Badge variant="outline" className="bg-secondary-500/20 text-secondary-400 border-secondary-400/30">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-400">Status:</span>
                    <Badge variant={getStockBadgeColor(product)}>
                      {getStockText(product)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    <Package2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Ajustar</span>
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Vender</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-400 mb-2">Nenhum produto encontrado</p>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione novos produtos</p>
          </div>
        )}

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
        />
      </div>
    </section>
  );
}
