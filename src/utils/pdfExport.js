import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportFinancialReportPDF = (summary, transactions, goals, format) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('Reporte Financiero', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

  // Summary Metrics
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumen General', 14, 45);
  
  doc.autoTable({
    startY: 50,
    head: [['Métrica', 'Valor']],
    body: [
      ['Ingresos Totales', format(summary.income)],
      ['Gastos Totales', format(summary.expense)],
      ['Balance Neto', format(summary.balance)],
      ['Ahorros', `${format(summary.savings)} (${summary.savingsPercentage}%)`],
      ['Promedio Gasto Diario', format(summary.avgDailyExpense)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Recent Transactions
  doc.text('Últimas Transacciones', 14, doc.lastAutoTable.finalY + 15);
  
  const recentTxs = transactions.slice(0, 10).map(t => [
    new Date(t.createdAt).toLocaleDateString(),
    t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
    t.category?.name || 'Varios',
    format(t.amount),
    t.description || '-'
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Fecha', 'Tipo', 'Categoría', 'Monto', 'Descripción']],
    body: recentTxs,
    theme: 'striped',
  });

  // Goals
  if (goals.length > 0) {
    doc.text('Estado de Metas', 14, doc.lastAutoTable.finalY + 15);
    
    const goalsData = goals.map(g => {
      const percentage = Math.min(100, Math.round((g.current / g.target) * 100));
      return [
        g.title,
        `${format(g.current)} / ${format(g.target)}`,
        `${percentage}%`,
        g.status === 'completed' ? 'Completada' : 'En progreso'
      ];
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Meta', 'Progreso', '%', 'Estado']],
      body: goalsData,
      theme: 'plain',
    });
  }

  doc.save('reporte-financiero.pdf');
};
