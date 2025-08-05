import type { SaleWithItems, Product } from "@shared/schema";
import { formatPrice } from "./utils";

interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalProducts: number;
  averageTicket: number;
  sales: SaleWithItems[];
  topProducts: Array<Product & { totalSold: number; totalRevenue: number }>;
}

const nameStore = "L'amourshoes";

export async function generatePDFReport(data: ReportData): Promise<void> {
  // Create HTML content for the PDF
  const htmlContent = generateReportHTML(data);

  // Create a temporary iframe to render the content
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error("Não foi possível criar o documento PDF");
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for content to load
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Trigger print dialog
  iframe.contentWindow?.print();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

function generateReportHTML(data: ReportData): string {
  const currentDate = new Date().toLocaleDateString("pt-BR");
  const periodLabel = getPeriodLabel(data.period);

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Vendas - ${nameStore}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #8B5CF6;
        }
        
        .header h1 {
          color: #8B5CF6;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header h2 {
          color: #666;
          font-size: 18px;
          font-weight: normal;
        }
        
        .report-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .report-info h3 {
          color: #333;
          margin-bottom: 10px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .metric-card {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        
        .metric-card h4 {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 10px;
        }
        
        .metric-card .value {
          font-size: 24px;
          font-weight: bold;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section h3 {
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e9ecef;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .table th,
        .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }
        
        .table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        
        .table tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .currency {
          color: #10B981;
          font-weight: 600;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #666;
          font-size: 12px;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: none;
            margin: 0;
            padding: 15px;
          }
          
          .header {
            page-break-after: avoid;
          }
          
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${nameStore}</h1>
          <h2>Relatório de Vendas</h2>
        </div>
        
        <div class="report-info">
          <h3>Informações do Relatório</h3>
          <p><strong>Período:</strong> ${periodLabel}</p>
          ${
            data.startDate && data.endDate
              ? `<p><strong>Data:</strong> ${new Date(data.startDate).toLocaleDateString("pt-BR")} a ${new Date(
                  data.endDate
                ).toLocaleDateString("pt-BR")}</p>`
              : ""
          }
          <p><strong>Gerado em:</strong> ${currentDate}</p>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Receita Total</h4>
            <div class="value">R$ ${data.totalRevenue.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <h4>Produtos Vendidos</h4>
            <div class="value">${data.totalProducts}</div>
          </div>
          <div class="metric-card">
            <h4>Ticket Médio</h4>
            <div class="value">R$ ${data.averageTicket.toFixed(2)}</div>
          </div>
        </div>
        
        <div class="section">
          <h3>Produtos Mais Vendidos</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Qtd. Vendida</th>
                <th>Receita Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.topProducts
                .slice(0, 10)
                .map(
                  (product) => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${product.totalSold}</td>
                  <td class="currency">R$ ${product.totalRevenue.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>Histórico de Vendas</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Pagamento</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.sales
                .slice(0, 50)
                .map(
                  (sale) => `
                <tr>
                  <td>${new Date(sale.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td>${sale.customerName || "Cliente Anônimo"}</td>
                  <td>${sale.items.length} produto(s)</td>
                  <td>${getPaymentMethodLabel(sale.paymentMethod)}</td>
                  <td class="currency">R$ ${Number(sale.total).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          ${
            data.sales.length > 50
              ? `<p><em>Mostrando os primeiros 50 registros de ${data.sales.length} vendas.</em></p>`
              : ""
          }
        </div>
        
        <div class="footer">
          <p>Relatório gerado pelo CashFlow  - Sistema de Controle de Caixa</p>
          <p>Data de geração: ${currentDate}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    "this-month": "Este Mês",
    "last-month": "Último Mês",
    "last-3-months": "Últimos 3 Meses",
    "this-year": "Este Ano",
    custom: "Período Personalizado",
  };

  return labels[period] || "Período Selecionado";
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: "Dinheiro",
    debit: "Cartão de Débito",
    credit: "Cartão de Crédito",
    pix: "PIX",
  };

  return labels[method] || method;
}

export async function generateReceiptPDF(sale: SaleWithItems): Promise<void> {
  const htmlContent = generateReceiptHTML(sale);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "80mm";
  iframe.style.height = "auto";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error("Não foi possível criar o documento PDF");
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  iframe.contentWindow?.print();

  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

function generateReceiptHTML(sale: SaleWithItems): string {
  const date = new Date(sale.createdAt).toLocaleDateString("pt-BR");
  const time = new Date(sale.createdAt).toLocaleTimeString("pt-BR");
  const paymentLabel = getPaymentMethodLabel(sale.paymentMethod);

  // Calcular valores
  const subtotal = sale.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const totalDiscounts = sale.items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const total = Number(sale.total);

  return /* html */ `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Comprovante de Venda</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', monospace;
          line-height: 1.3;
          color: #000;
          background: white;
          padding: 8px;
          max-width: 300px;
          margin: 0 auto;
          font-size: 11px;
        }

        .receipt {
          border: 1px solid #000;
          padding: 12px;
          background: white;
        }

        .store-name {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          border-bottom: 1px solid #000;
          padding-bottom: 6px;
        }

        .purchase-date {
          text-align: center;
          font-size: 10px;
          margin-bottom: 12px;
          border-bottom: 1px dotted #000;
          padding-bottom: 6px;
        }

        .items-section {
          margin-bottom: 12px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 10px;
          border-bottom: 1px dotted #000;
          padding-bottom: 2px;
        }

        .item-details {
          flex: 1;
        }

        .item-qty {
          font-weight: bold;
          margin-right: 5px;
        }

        .item-name {
          font-weight: bold;
        }

        .item-value {
          font-weight: bold;
          text-align: right;
          min-width: 60px;
        }

        .totals-section {
          border-top: 1px solid #000;
          padding-top: 8px;
          margin-bottom: 12px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 10px;
        }

        .total-line.final {
          font-size: 12px;
          font-weight: bold;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 6px 0;
          margin-top: 6px;
        }

        .payment-section {
          text-align: center;
          font-size: 10px;
          font-weight: bold;
          border: 1px solid #000;
          padding: 6px;
          background: #f5f5f5;
        }

        .footer {
          text-align: center;
          margin-top: 12px;
          font-size: 9px;
          border-top: 1px dotted #000;
          padding-top: 6px;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          
          body {
            margin: 0;
            padding: 5px;
            font-size: 10px;
          }
          
          .receipt {
            border: 1px solid #000;
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <!-- Nome da loja -->
        <div class="store-name">
          ${nameStore}
        </div>

        <!-- Data da compra -->
        <div class="purchase-date">
          ${date} - ${time}
        </div>

        <!-- Produtos -->
        <div class="items-section">
          ${sale.items
            .map(
              (item) => `
              <div class="item">
                <div class="item-details">
                  <span class="item-qty">${item.quantity}x</span>
                  <span class="item-name">${item.productName}</span>
                </div>
                <div class="item-value">R$ ${formatPrice(Number(item.subtotal))}</div>
              </div>
            `
            )
            .join("")}
        </div>

        <!-- Totais -->
        <div class="totals-section">
          <div class="total-line">
            <span>Valor dos produtos:</span>
            <span>R$ ${formatPrice(subtotal)}</span>
          </div>
          
          ${totalDiscounts > 0 ? `
            <div class="total-line">
              <span>Descontos:</span>
              <span>- R$ ${formatPrice(totalDiscounts)}</span>
            </div>
          ` : ''}
          
          <div class="total-line final">
            <span>TOTAL:</span>
            <span>R$ ${formatPrice(total)}</span>
          </div>
        </div>

        <!-- Forma de pagamento -->
        <div class="payment-section">
          FORMA DE PAGAMENTO: ${paymentLabel.toUpperCase()}
        </div>

        <!-- Footer -->
        <div class="footer">
          ${sale.customerName ? `Cliente: ${sale.customerName}<br>` : ''}
          Obrigado pela compra!<br>
          ${nameStore}
        </div>
      </div>
    </body>
    </html>
  `;
}
