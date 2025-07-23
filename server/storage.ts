import { 
  Product, 
  InsertProduct, 
  StockMovement, 
  InsertStockMovement, 
  Sale, 
  InsertSale, 
  SaleItem, 
  InsertSaleItem,
  DashboardMetrics,
  SaleWithItems,
  ProductWithStock
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Stock movements
  getStockMovements(): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getProductStockHistory(productId: number): Promise<StockMovement[]>;
  
  // Sales
  getSales(): Promise<SaleWithItems[]>;
  getSale(id: number): Promise<SaleWithItems | undefined>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems>;
  
  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getLowStockProducts(): Promise<ProductWithStock[]>;
  getRecentSales(limit?: number): Promise<SaleWithItems[]>;
  
  // Reports
  getSalesInDateRange(startDate: Date, endDate: Date): Promise<SaleWithItems[]>;
  getTopProducts(limit?: number): Promise<Array<Product & { totalSold: number; totalRevenue: number }>>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private stockMovements: Map<number, StockMovement>;
  private sales: Map<number, Sale>;
  private saleItems: Map<number, SaleItem>;
  private currentProductId: number;
  private currentStockMovementId: number;
  private currentSaleId: number;
  private currentSaleItemId: number;

  constructor() {
    this.products = new Map();
    this.stockMovements = new Map();
    this.sales = new Map();
    this.saleItems = new Map();
    this.currentProductId = 1;
    this.currentStockMovementId = 1;
    this.currentSaleId = 1;
    this.currentSaleItemId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "Smartphone XYZ Pro",
        description: "Smartphone Android com 128GB de armazenamento e câmera tripla de alta resolução.",
        price: "899.00",
        stock: 24,
        minStock: 10,
        category: "Eletrônicos"
      },
      {
        name: "Fone Bluetooth Elite",
        description: "Fone de ouvido wireless com cancelamento de ruído ativo e bateria de longa duração.",
        price: "199.00",
        stock: 3,
        minStock: 10,
        category: "Acessórios"
      },
      {
        name: "Notebook Pro Max",
        description: "Laptop profissional com processador i7, 16GB RAM e SSD 512GB para máxima performance.",
        price: "3299.00",
        stock: 12,
        minStock: 5,
        category: "Informática"
      }
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...updateData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getStockMovements(): Promise<StockMovement[]> {
    return Array.from(this.stockMovements.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const id = this.currentStockMovementId++;
    const movement: StockMovement = {
      ...insertMovement,
      id,
      createdAt: new Date()
    };
    this.stockMovements.set(id, movement);

    // Update product stock
    const product = this.products.get(insertMovement.productId);
    if (product) {
      product.stock = insertMovement.newStock;
      this.products.set(product.id, product);
    }

    return movement;
  }

  async getProductStockHistory(productId: number): Promise<StockMovement[]> {
    return Array.from(this.stockMovements.values())
      .filter(movement => movement.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSales(): Promise<SaleWithItems[]> {
    const sales = Array.from(this.sales.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sales.map(sale => ({
      ...sale,
      items: Array.from(this.saleItems.values()).filter(item => item.saleId === sale.id)
    }));
  }

  async getSale(id: number): Promise<SaleWithItems | undefined> {
    const sale = this.sales.get(id);
    if (!sale) return undefined;

    return {
      ...sale,
      items: Array.from(this.saleItems.values()).filter(item => item.saleId === id)
    };
  }

  async createSale(insertSale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems> {
    const saleId = this.currentSaleId++;
    const sale: Sale = {
      ...insertSale,
      id: saleId,
      createdAt: new Date()
    };
    this.sales.set(saleId, sale);

    const saleItems: SaleItem[] = [];
    for (const item of items) {
      const saleItemId = this.currentSaleItemId++;
      const saleItem: SaleItem = {
        ...item,
        id: saleItemId,
        saleId
      };
      this.saleItems.set(saleItemId, saleItem);
      saleItems.push(saleItem);

      // Update product stock
      const product = this.products.get(item.productId);
      if (product) {
        const previousStock = product.stock;
        const newStock = previousStock - item.quantity;
        product.stock = newStock;
        this.products.set(product.id, product);

        // Create stock movement
        await this.createStockMovement({
          productId: item.productId,
          type: 'out',
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: 'Venda'
        });
      }
    }

    return {
      ...sale,
      items: saleItems
    };
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = Array.from(this.sales.values())
      .filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= today && saleDate < tomorrow;
      });

    const todaySalesTotal = todaySales.reduce((sum, sale) => sum + Number(sale.total), 0);
    
    const todayProductsSold = todaySales.reduce((sum, sale) => {
      const items = Array.from(this.saleItems.values()).filter(item => item.saleId === sale.id);
      return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const totalStock = Array.from(this.products.values())
      .reduce((sum, product) => sum + product.stock, 0);

    const totalProducts = this.products.size;

    return {
      todaySales: todaySalesTotal,
      todayProductsSold,
      totalStock,
      totalProducts,
      salesGrowth: 12, // Mock growth percentage
      stockGrowth: -3  // Mock growth percentage
    };
  }

  async getLowStockProducts(): Promise<ProductWithStock[]> {
    return Array.from(this.products.values())
      .filter(product => product.stock <= product.minStock)
      .map(product => ({
        ...product,
        isLowStock: true
      }));
  }

  async getRecentSales(limit = 10): Promise<SaleWithItems[]> {
    const sales = await this.getSales();
    return sales.slice(0, limit);
  }

  async getSalesInDateRange(startDate: Date, endDate: Date): Promise<SaleWithItems[]> {
    const sales = await this.getSales();
    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  async getTopProducts(limit = 10): Promise<Array<Product & { totalSold: number; totalRevenue: number }>> {
    const products = Array.from(this.products.values());
    const productStats = products.map(product => {
      const items = Array.from(this.saleItems.values())
        .filter(item => item.productId === product.id);
      
      const totalSold = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

      return {
        ...product,
        totalSold,
        totalRevenue
      };
    });

    return productStats
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
