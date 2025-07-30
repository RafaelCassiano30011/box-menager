import { FastifyRequest, FastifyReply } from "fastify";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { DrizzleSalesRepository } from "server/src/repositories/drizzle/drizzle-sales-repository";
import { DrizzleStockMovementsRepository } from "server/src/repositories/drizzle/drizzle-stock-movements-repository";
import { CreateSaleUseCase } from "server/src/useCases/sales/create-sale-use-case";
import z from "zod";

// Define the request type

export const createSale = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    console.log(req.body);

    // Validate the entire request body with items included
    const dataParse = z
      .object({
        customerName: z.string().optional(),
        paymentMethod: z.string(),
        items: z.array(
          z.object({
            productId: z.string().uuid(),
            productName: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number(),
            discount: z.number().optional().nullable(),
          })
        ),
      })
      .parse(req.body);

    const createSaleUseCase = new CreateSaleUseCase(
      new DrizzleSalesRepository(),
      new DrizzleProductRepository(),
      new DrizzleStockMovementsRepository()
    );

    const validatedData = {
      ...dataParse,
      items: dataParse.items.map((item) => ({
        ...item,
        discount: item.discount ? item.discount.toFixed(2) : undefined,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: (Number(item.unitPrice) * item.quantity * (1 - Number(item.discount || 0) / 100)).toFixed(2),
      })),
    };

    const saleResult = await createSaleUseCase.execute(validatedData);

    return res.status(201).send({
      success: true,
      data: saleResult,
    });
  } catch (error) {
    throw error;
  }
};
