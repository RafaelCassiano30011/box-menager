import { useEffect, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { z } from "zod";
import { uploadImage } from "@/services/uploadImage";
import { Plus, X } from "lucide-react";

const formSchema = insertProductSchema.extend({
  price: z.string().min(1, "Preço é obrigatório"),
  minStock: z.string().min(0, "Estoque mínimo deve ser 0 ou maior"),
});

type FormData = z.infer<typeof formSchema>;

interface Variation {
  id: string;
  variation: string;
  stock: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [variations, setVariations] = useState<Variation[]>([]);
  const [newVariation, setNewVariation] = useState("");
  const [newVariationStock, setNewVariationStock] = useState("");

  // Buscar variações existentes
  const { data: existingVariations = [] } = useQuery({
    queryKey: ["/api/variations"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/variations");
        return (response as any) || [];
      } catch (error) {
        return [];
      }
    },
  });

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
      image: "",
      description: "",
      price: "",
      minStock: "",
      category: "",
      variations: [],
    },
  });

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
    mutationFn: async (data: { id: string; product: Partial<InsertProduct> }) => {
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
      setValue("image", product.image);
      setValue("description", product.description || "");
      setValue("price", product.price);
      setValue("minStock", product.minStock.toString());
      setValue("category", product.category);
      setValue("variations", product.variations || []);
      setVariations(product.variations || []);
    } else {
      reset();
      setVariations([]);
    }
  }, [product, setValue, reset]);

  const onSubmit = (data: FormData) => {
    const productData: InsertProduct = {
      name: data.name,
      image: data.image,
      description: data.description || undefined,
      price: data.price,
      minStock: parseInt(data.minStock),
      category: data.category,
      variations: variations,
    };

    if (product) {
      updateProductMutation.mutate({ id: product.id, product: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const addVariation = () => {
    if (!newVariation.trim() || !newVariationStock) return;

    const variation: Variation = {
      id: Date.now().toString(),
      variation: newVariation.trim(),
      stock: parseInt(newVariationStock),
    };

    const updatedVariations = [...variations, variation];
    setVariations(updatedVariations);
    setValue("variations", updatedVariations);
    setNewVariation("");
    setNewVariationStock("");
  };

  const removeVariation = (id: string) => {
    const updatedVariations = variations.filter(v => v.id !== id);
    setVariations(updatedVariations);
    setValue("variations", updatedVariations);
  };

  const updateVariationStock = (id: string, stock: number) => {
    const updatedVariations = variations.map(v => 
      v.id === id ? { ...v, stock } : v
    );
    setVariations(updatedVariations);
    setValue("variations", updatedVariations);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-800 border-secondary-400/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            {product ? "Editar Produto" : "Cadastrar Novo Produto"}
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
                id="category"
                {...register("category")}
                className="bg-dark-900 border-gray-600 focus:border-secondary-400"
              />

              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="image" className="text-gray-300">
              Imagem do Produto
            </Label>
            <Input
              id="image"
              type="file"
              multiple={false}
              accept="image/png, image/jpeg, image/jpg"
              placeholder="Selecione uma imagem"
              className="bg-dark-900 border-gray-600 focus:border-secondary-400 cursor-pointer"
              onInput={async (e) => {
                console.log("arroz");
                const fileList = e.currentTarget.files;

                if (fileList && fileList.length > 0) {
                  const file = fileList[0];

                  const { error, secure_url } = await uploadImage(file);

                  if (error || !secure_url) {
                    toast({
                      title: "Erro ao fazer upload da imagem",
                      description: error,
                      variant: "destructive",
                    });
                    return;
                  }

                  setValue("image", secure_url);
                }
              }}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Seção de Variações */}
          <div>
            <Label className="text-gray-300 text-lg font-semibold">Variações do Produto</Label>
            
            {/* Adicionar nova variação */}
            <div className="mt-3 p-4 border border-gray-600 rounded-lg bg-dark-900">
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <Input
                    placeholder="Digite uma variação (ex: Tamanho 38, Cor Azul)"
                    value={newVariation}
                    onChange={(e) => setNewVariation(e.target.value)}
                    className="bg-dark-800 border-gray-600 focus:border-secondary-400"
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    min="0"
                    value={newVariationStock}
                    onChange={(e) => setNewVariationStock(e.target.value)}
                    className="bg-dark-800 border-gray-600 focus:border-secondary-400"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addVariation}
                  className="bg-secondary-500 hover:bg-secondary-600"
                  disabled={!newVariation.trim() || !newVariationStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Sugestões de variações existentes */}
              {existingVariations.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-400 mb-2">Variações existentes (clique para adicionar):</p>
                  <div className="flex flex-wrap gap-2">
                    {(existingVariations as string[]).map((variation: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setNewVariation(variation)}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                      >
                        {variation}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lista de variações adicionadas */}
            {variations.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400">Variações adicionadas:</p>
                {variations.map((variation) => (
                  <div key={variation.id} className="flex items-center gap-2 p-3 bg-dark-800 rounded border border-gray-600">
                    <div className="flex-1">
                      <span className="text-gray-300">{variation.variation}</span>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="0"
                        value={variation.stock}
                        onChange={(e) => updateVariationStock(variation.id, parseInt(e.target.value) || 0)}
                        className="bg-dark-900 border-gray-600 focus:border-secondary-400 text-center"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeVariation(variation.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
