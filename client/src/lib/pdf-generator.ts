import type { SaleWithItems, Product } from "@shared/schema";

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

export async function generatePDFReport(data: ReportData): Promise<void> {
  // Create HTML content for the PDF
  const htmlContent = generateReportHTML(data);
  
  // Create a temporary iframe to render the content
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('Não foi possível criar o documento PDF');
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Trigger print dialog
  iframe.contentWindow?.print();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

function generateReportHTML(data: ReportData): string {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const periodLabel = getPeriodLabel(data.period);
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Vendas - CashFlow Pro</title>
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
          <h1>CashFlow Pro</h1>
          <h2>Relatório de Vendas</h2>
        </div>
        
        <div class="report-info">
          <h3>Informações do Relatório</h3>
          <p><strong>Período:</strong> ${periodLabel}</p>
          ${data.startDate && data.endDate ? 
            `<p><strong>Data:</strong> ${new Date(data.startDate).toLocaleDateString('pt-BR')} a ${new Date(data.endDate).toLocaleDateString('pt-BR')}</p>` : 
            ''
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
              ${data.topProducts.slice(0, 10).map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${product.totalSold}</td>
                  <td class="currency">R$ ${product.totalRevenue.toFixed(2)}</td>
                </tr>
              `).join('')}
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
              ${data.sales.slice(0, 50).map(sale => `
                <tr>
                  <td>${new Date(sale.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>${sale.customerName || 'Cliente Anônimo'}</td>
                  <td>${sale.items.length} produto(s)</td>
                  <td>${getPaymentMethodLabel(sale.paymentMethod)}</td>
                  <td class="currency">R$ ${Number(sale.total).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${data.sales.length > 50 ? 
            `<p><em>Mostrando os primeiros 50 registros de ${data.sales.length} vendas.</em></p>` : 
            ''
          }
        </div>
        
        <div class="footer">
          <p>Relatório gerado pelo CashFlow Pro - Sistema de Controle de Caixa</p>
          <p>Data de geração: ${currentDate}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    'this-month': 'Este Mês',
    'last-month': 'Último Mês',
    'last-3-months': 'Últimos 3 Meses',
    'this-year': 'Este Ano',
    'custom': 'Período Personalizado',
  };
  
  return labels[period] || 'Período Selecionado';
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    'cash': 'Dinheiro',
    'debit': 'Cartão de Débito',
    'credit': 'Cartão de Crédito',
    'pix': 'PIX',
  };
  
  return labels[method] || method;
}
