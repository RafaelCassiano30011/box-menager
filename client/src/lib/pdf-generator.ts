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

const nameStore = "CashFlow Pro";

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

  return `
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.5;
          color: #1f2937;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 40px 20px;
          min-height: 100vh;
        }

        .receipt-container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          position: relative;
        }

        .receipt-header {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          text-align: center;
          padding: 32px 24px;
          position: relative;
        }

        .receipt-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.15"/><circle cx="20" cy="60" r="0.5" fill="%23ffffff" opacity="0.15"/><circle cx="80" cy="30" r="0.5" fill="%23ffffff" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }

        .receipt-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .receipt-header h2 {
          font-size: 16px;
          font-weight: 400;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }

        .receipt-body {
          padding: 32px 24px;
        }

        .receipt-info {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          border-left: 4px solid #8b5cf6;
        }

        .receipt-info p {
          margin-bottom: 8px;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .receipt-info strong {
          color: #374151;
          font-weight: 600;
        }

        .receipt-info span {
          color: #6b7280;
        }

        .items-section {
          margin-bottom: 24px;
        }

        .items-header {
          background: #f8fafc;
          padding: 16px 0;
          border-radius: 8px 8px 0 0;
          margin-bottom: 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        th {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }

        tr:nth-child(even) td {
          background: #f9fafb;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .item-name {
          font-weight: 600;
          color: #374151;
        }

        .item-quantity {
          text-align: center;
          font-weight: 600;
          color: #8b5cf6;
        }

        .item-price {
          text-align: right;
          font-family: 'Courier New', monospace;
          color: #059669;
          font-weight: 600;
        }

        .total-section {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin: 24px 0;
          text-align: center;
        }

        .total-section h3 {
          font-size: 16px;
          font-weight: 400;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .total-amount {
          font-size: 32px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          color: #10b981;
        }

        .signature-section {
          margin-top: 40px;
          padding: 24px 0;
          border-top: 2px dashed #d1d5db;
        }

        .signature-line {
          width: 280px;
          height: 2px;
          background: linear-gradient(90deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%);
          margin: 32px auto 12px;
          border-radius: 1px;
        }

        .signature-label {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .receipt-footer {
          background: #f8fafc;
          text-align: center;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .receipt-footer p {
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .receipt-footer .brand {
          color: #8b5cf6;
          font-weight: 600;
          font-size: 16px;
        }

        .thank-you {
          font-size: 18px;
          font-weight: 600;
          color: #10b981;
          margin-bottom: 8px;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .receipt-container {
            box-shadow: none;
            max-width: none;
            margin: 0;
          }

          .signature-line {
            margin-top: 50px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="receipt-header">
          <h1>🏪 ${nameStore}</h1>
          <h2>Comprovante de Venda</h2>
        </div>

        <div class="receipt-body">
          <div class="receipt-info">
            <p><strong>📅 Data:</strong> <span>${date} às ${time}</span></p>
            <p><strong>👤 Cliente:</strong> <span>${sale.customerName || "Cliente Anônimo"}</span></p>
            <p><strong>💳 Pagamento:</strong> <span>${paymentLabel}</span></p>
          </div>

          <div class="items-section">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items
                  .map(
                    (item) => `
                    <tr>
                      <td class="item-name">${item.productName}</td>
                      <td class="item-quantity">${item.quantity}</td>
                      <td class="item-price">${formatPrice(Number(item.unitPrice))}</td>
                      <td class="item-price">${formatPrice(Number(item.subtotal))}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <h3>Total da Venda</h3>
            <div class="total-amount">R$ ${formatPrice(Number(sale.total))}</div>
          </div>

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">✍️ Assinatura do Vendedor</div>
            <div class="signature-line"></div>
            <div class="signature-label">✍️ Assinatura do Cliente (Opcional)</div>
          </div>
        </div>

        <div class="receipt-footer">
          <p class="thank-you">✨ Obrigado pela compra!</p>
          <p class="brand">${nameStore}</p>
          <p>Sistema de Vendas & Controle de Estoque</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
