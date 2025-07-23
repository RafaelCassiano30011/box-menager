import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { z } from "zod";

const formSchema = insertProductSchema.extend({
  price: z.string().min(1, "Preço é obrigatório"),
  stock: z.string().min(1, "Estoque inicial é obrigatório"),
  minStock: z.string().min(0, "Estoque mínimo deve ser 0 ou maior"),
});

type FormData = z.infer<typeof formSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      minStock: "",
      category: "",
    },
  });

  const selectedCategory = watch("category");

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o produto.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: number; product: Partial<InsertProduct> }) => {
      return await apiRequest("PUT", `/api/products/${data.id}`, data.product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("description", product.description || "");
      setValue("price", product.price);
      setValue("stock", product.stock.toString());
      setValue("minStock", product.minStock.toString());
      setValue("category", product.category);
    } else {
      reset();
    }
  }, [product, setValue, reset]);

  const onSubmit = (data: FormData) => {
    const productData: InsertProduct = {
      name: data.name,
      description: data.description || undefined,
      price: data.price,
      stock: parseInt(data.stock),
      minStock: parseInt(data.minStock),
      category: data.category,
    };

    if (product) {
      updateProductMutation.mutate({ id: product.id, product: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-800 border-secondary-400/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            {product ? "Editar Produto" : "Cadastrar Novo Produto"}
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white"></Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Nome do Produto
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-dark-900 border-gray-600 focus:border-secondary-400"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-300">
                Categoria
              </Label>
              <Input
                value={selectedCategory}
                {...register("category")}
                className="bg-dark-900 border-gray-600 focus:border-secondary-400"
              />

              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">
              Descrição
            </Label>
            <Textarea
              id="description"
              rows={3}
              {...register("description")}
              className="bg-dark-900 border-gray-600 focus:border-secondary-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price" className="text-gray-300">
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price")}
                className="bg-dark-900 border-gray-600 focus:border-secondary-400"
              />
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="stock" className="text-gray-300">
                {product ? "Estoque Atual" : "Estoque Inicial"}
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register("stock")}
                className="bg-dark-900 border-gray-600 focus:border-secondary-400"
              />
              {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock.message}</p>}
            </div>

            <div>
              <Label htmlFor="minStock" className="text-gray-300">
                Estoque Mínimo
              </Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                {...register("minStock")}
                className="bg-dark-900 border-gray-600 focus:border-secondary-400"
              />
              {errors.minStock && <p className="text-red-400 text-sm mt-1">{errors.minStock.message}</p>}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 hover:border-gray-500"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600"
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
              {createProductMutation.isPending || updateProductMutation.isPending
                ? "Salvando..."
                : product
                ? "Atualizar Produto"
                : "Salvar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
