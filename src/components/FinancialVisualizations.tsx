import React, { useMemo } from 'react';
import { 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Upload, 
  Info,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';

interface Transaction {
  Date: string;
  Transaction_ID: string;
  Client_Vendor: string;
  Category: string;
  Type: 'Revenue' | 'Expense';
  Amount: string;
  Anomaly_Note?: string;
  risk_flag?: string;
  risk_flags?: string[];
  vat_number?: string;
  has_payment_means_iban?: boolean;
  ogm_reference?: string;
  is_valid_ogm?: boolean;
  vat_grid?: '81' | '82' | '83';
  source_type?: 'csv' | 'xml';
}

interface FinancialVisualizationsProps {
  transactions: Transaction[];
  onUploadClick?: () => void;
  onLoadDemo?: () => void;
}

function formatShortEuro(val: number): string {
  if (Math.abs(val) >= 1_000_000) {
    return `€${(val / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `€${(val / 1_000).toFixed(1)}k`;
  }
  return `€${val.toFixed(0)}`;
}

/**
 * 1. Native SVG Bar Chart (Revenue vs. Expenses by Category)
 * - Pure SVG <svg>, <rect>, <text>, <line>
 * - Grouped by Category with green for Revenue and red/rose for Expenses
 * - Scaled dynamically based on maximum amount
 * - Responsive via viewBox="0 0 800 400"
 */
export function CategoryBarChart({ transactions }: { transactions: Transaction[] }) {
  // Aggregate total amounts grouped by Category
  const categoryData = useMemo(() => {
    const map = new Map<string, { total: number; revenue: number; expense: number; count: number }>();

    transactions.forEach(tx => {
      const cat = tx.Category || 'Other';
      const num = parseFloat(tx.Amount);
      const amt = isNaN(num) ? 0 : Math.abs(num);
      const current = map.get(cat) || { total: 0, revenue: 0, expense: 0, count: 0 };

      if (tx.Type === 'Revenue') {
        current.revenue += amt;
      } else {
        current.expense += amt;
      }
      current.total += amt;
      current.count += 1;
      map.set(cat, current);
    });

    const list = Array.from(map.entries()).map(([category, val]) => {
      const dominantType: 'Revenue' | 'Expense' = val.revenue >= val.expense ? 'Revenue' : 'Expense';
      return {
        category,
        total: val.total,
        revenue: val.revenue,
        expense: val.expense,
        type: dominantType,
        count: val.count
      };
    });

    // Sort descending by total amount
    return list.sort((a, b) => b.total - a.total);
  }, [transactions]);

  const svgWidth = 800;
  const svgHeight = 400;
  const margin = { top: 40, right: 30, bottom: 95, left: 75 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  // Dynamically calculate the maximum value to scale the Y-axis
  const maxVal = useMemo(() => {
    const rawMax = Math.max(...categoryData.map(c => c.total), 1000);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const factor = Math.ceil(rawMax / magnitude);
    return factor * magnitude;
  }, [categoryData]);

  // 5 Y-axis ticks
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  const barCount = categoryData.length;
  const bandWidth = barCount > 0 ? chartWidth / barCount : chartWidth;
  const barWidth = Math.min(Math.max(bandWidth * 0.65, 16), 52);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none drop-shadow-sm font-sans"
        aria-label="Revenue vs Expenses by Category Bar Chart"
      >
        <defs>
          <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Background Grid Lines & Y-Axis Labels */}
        {yTicks.map((tick, i) => {
          const yPos = margin.top + chartHeight - (tick / maxVal) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={margin.left}
                y1={yPos}
                x2={margin.left + chartWidth}
                y2={yPos}
                stroke="#334155"
                strokeWidth={tick === 0 ? "1.5" : "1"}
                strokeDasharray={tick === 0 ? "none" : "4 4"}
                opacity={tick === 0 ? "0.8" : "0.4"}
              />
              <text
                x={margin.left - 12}
                y={yPos + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                className="select-none font-medium"
              >
                {formatShortEuro(tick)}
              </text>
            </g>
          );
        })}

        {/* Category Bars */}
        {categoryData.map((item, idx) => {
          const xCenter = margin.left + (idx + 0.5) * bandWidth;
          const barHeight = Math.max((item.total / maxVal) * chartHeight, 4);
          const xPos = xCenter - barWidth / 2;
          const yPos = margin.top + chartHeight - barHeight;

          // Green fill for "Revenue" categories and red/rose fill for "Expense" categories
          const isRevenue = item.type === 'Revenue';
          const barFill = isRevenue ? 'url(#revenueBarGrad)' : 'url(#expenseBarGrad)';
          const labelColor = isRevenue ? '#34d399' : '#fb7185';

          // Format category text: truncate if too long
          const displayName = item.category.length > 18 
            ? `${item.category.slice(0, 16)}...` 
            : item.category;

          return (
            <g key={item.category} className="group">
              {/* Category Bar */}
              <rect
                x={xPos}
                y={yPos}
                width={barWidth}
                height={barHeight}
                fill={barFill}
                rx="4"
                ry="4"
                className="transition-all duration-200 hover:brightness-110 cursor-pointer"
              >
                <title>
                  {`${item.category} (${item.type})\nTotal: €${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\nEntries: ${item.count} transactions\nBreakdown: +€${item.revenue.toFixed(2)} / -€${item.expense.toFixed(2)}`}
                </title>
              </rect>

              {/* Amount Label Above or Inside the Bar */}
              <text
                x={xCenter}
                y={yPos - 8}
                textAnchor="middle"
                fill={labelColor}
                fontSize="11"
                fontWeight="700"
                fontFamily="monospace"
                className="select-none"
              >
                {formatShortEuro(item.total)}
              </text>

              {/* Category Name along X-Axis */}
              <text
                x={xCenter}
                y={margin.top + chartHeight + 18}
                textAnchor="end"
                transform={`rotate(-40, ${xCenter}, ${margin.top + chartHeight + 18})`}
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="500"
                className="select-none group-hover:fill-white transition"
              >
                {displayName}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${margin.left}, 15)`}>
          <rect x="0" y="0" width="12" height="12" rx="3" fill="#10b981" />
          <text x="18" y="10" fill="#cbd5e1" fontSize="11" fontWeight="600">
            Revenue Categories
          </text>

          <rect x="160" y="0" width="12" height="12" rx="3" fill="#f43f5e" />
          <text x="178" y="10" fill="#cbd5e1" fontSize="11" fontWeight="600">
            Expense Categories
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * 2. Native SVG Line Chart (Cash Flow Trend)
 * - Chronologically sorted by Date
 * - Running total of Net Position (Revenue adds, Expense subtracts)
 * - SVG <polyline> and area gradient <path>
 * - Interactive <circle> points with native <title> tooltips
 * - Responsive via viewBox="0 0 800 400"
 */
export function CashFlowLineChart({ transactions }: { transactions: Transaction[] }) {
  // 1. Sort transactions by Date and compute running cumulative Net Position
  const trendData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.Date.localeCompare(b.Date));
    let runningNet = 0;

    return sorted.map((tx, idx) => {
      const num = parseFloat(tx.Amount);
      const amt = isNaN(num) ? 0 : num;
      if (tx.Type === 'Revenue') {
        runningNet += amt;
      } else {
        runningNet -= amt;
      }

      return {
        index: idx,
        date: tx.Date,
        id: tx.Transaction_ID,
        clientVendor: tx.Client_Vendor,
        category: tx.Category,
        type: tx.Type,
        amount: amt,
        runningNet
      };
    });
  }, [transactions]);

  const svgWidth = 800;
  const svgHeight = 400;
  const margin = { top: 40, right: 35, bottom: 65, left: 80 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  // Min and Max calculations with padding
  const { minVal, maxVal, zeroY } = useMemo(() => {
    if (trendData.length === 0) return { minVal: 0, maxVal: 1000, zeroY: margin.top + chartHeight };

    const nets = trendData.map(d => d.runningNet);
    const minNet = Math.min(...nets, 0);
    const maxNet = Math.max(...nets, 1000);
    const span = (maxNet - minNet) || 1000;

    // Add 10% vertical padding
    const paddedMin = minNet - span * 0.1;
    const paddedMax = maxNet + span * 0.1;
    const range = paddedMax - paddedMin;

    const zeroCoord = margin.top + chartHeight - ((0 - paddedMin) / range) * chartHeight;

    return {
      minVal: paddedMin,
      maxVal: paddedMax,
      zeroY: zeroCoord
    };
  }, [trendData, chartHeight, margin.top]);

  // Compute (x, y) coordinates for all points
  const points = useMemo(() => {
    const count = trendData.length;
    if (count === 0) return [];
    const range = maxVal - minVal;

    return trendData.map((d, i) => {
      const x = margin.left + (count === 1 ? chartWidth / 2 : (i / (count - 1)) * chartWidth);
      const y = margin.top + chartHeight - ((d.runningNet - minVal) / range) * chartHeight;
      return { ...d, x, y };
    });
  }, [trendData, minVal, maxVal, chartWidth, chartHeight, margin.left, margin.top]);

  // SVG Polyline string
  const polylinePoints = useMemo(() => {
    return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [points]);

  // Area path below the line for gradient fill
  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const baseY = margin.top + chartHeight;
    return `M ${first.x.toFixed(1)},${baseY} L ${polylinePoints} L ${last.x.toFixed(1)},${baseY} Z`;
  }, [points, polylinePoints, margin.top, chartHeight]);

  // Y-axis 5 ticks
  const yTicks = useMemo(() => {
    const step = (maxVal - minVal) / 4;
    return [
      minVal,
      minVal + step,
      minVal + step * 2,
      minVal + step * 3,
      maxVal
    ];
  }, [minVal, maxVal]);

  // Sample 6 evenly distributed date labels
  const dateTicks = useMemo(() => {
    if (points.length === 0) return [];
    if (points.length <= 6) return points;
    const step = Math.floor(points.length / 5);
    const ticks = [];
    for (let i = 0; i < points.length; i += step) {
      ticks.push(points[i]);
    }
    if (ticks[ticks.length - 1] !== points[points.length - 1]) {
      ticks.push(points[points.length - 1]);
    }
    return ticks;
  }, [points]);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none drop-shadow-sm font-sans"
        aria-label="Cash Flow Trend Line Chart"
      >
        <defs>
          <linearGradient id="cashFlowAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines & Y-Axis Labels */}
        {yTicks.map((val, i) => {
          const yPos = margin.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={margin.left}
                y1={yPos}
                x2={margin.left + chartWidth}
                y2={yPos}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <text
                x={margin.left - 12}
                y={yPos + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                className="select-none font-medium"
              >
                {formatShortEuro(val)}
              </text>
            </g>
          );
        })}

        {/* Zero Baseline reference line if within bounds */}
        {zeroY >= margin.top && zeroY <= margin.top + chartHeight && (
          <g>
            <line
              x1={margin.left}
              y1={zeroY}
              x2={margin.left + chartWidth}
              y2={zeroY}
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text
              x={margin.left + chartWidth + 6}
              y={zeroY + 3}
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="600"
            >
              €0
            </text>
          </g>
        )}

        {/* Area Gradient under Line */}
        {areaPath && (
          <path d={areaPath} fill="url(#cashFlowAreaGrad)" />
        )}

        {/* Trendline Polyline */}
        {polylinePoints && (
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />
        )}

        {/* Interactive Circles at each transaction data point */}
        {points.map((pt, i) => {
          const isPositive = pt.runningNet >= 0;
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={points.length > 40 ? 3.5 : 5}
              fill={isPositive ? "#10b981" : "#f43f5e"}
              stroke="#0f172a"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150 hover:scale-150 hover:brightness-125"
            >
              <title>
                {`${pt.date} · ${pt.id}\nVendor/Client: ${pt.clientVendor}\nCategory: ${pt.category}\nFlow: ${pt.type === 'Revenue' ? '+' : '-'}€${pt.amount.toFixed(2)}\nRunning Net Cash Position: €${pt.runningNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </title>
            </circle>
          );
        })}

        {/* X-Axis Date Labels */}
        {dateTicks.map((pt, i) => (
          <g key={i}>
            <line
              x1={pt.x}
              y1={margin.top + chartHeight}
              x2={pt.x}
              y2={margin.top + chartHeight + 6}
              stroke="#475569"
              strokeWidth="1"
            />
            <text
              x={pt.x}
              y={margin.top + chartHeight + 20}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
              className="select-none font-medium"
            >
              {pt.date}
            </text>
          </g>
        ))}

        {/* Trend Summary Badge */}
        {points.length > 0 && (
          <g transform={`translate(${margin.left}, 15)`}>
            <circle cx="5" cy="5" r="4" fill="#38bdf8" />
            <text x="16" y="9" fill="#e2e8f0" fontSize="11" fontWeight="600">
              Cumulative Net Cash Flow ({points.length} Data Points)
            </text>
            <text 
              x={chartWidth} 
              y="9" 
              textAnchor="end" 
              fill={points[points.length - 1].runningNet >= 0 ? "#34d399" : "#fb7185"} 
              fontSize="11" 
              fontWeight="bold" 
              fontFamily="monospace"
            >
              Current: €{points[points.length - 1].runningNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Empty State Placeholder Component
 * "If activeTransactions is empty, render a placeholder state saying 'Upload data to generate visualizations.'"
 */
export function EmptyVisualizationsPlaceholder({
  onUploadClick,
  onLoadDemo
}: {
  onUploadClick?: () => void;
  onLoadDemo?: () => void;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl max-w-2xl mx-auto my-8 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
        <TrendingUp className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Upload data to generate visualizations.
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Upload your general ledger CSV or Peppol UBL 2.1 XML e-invoices, or explore the pre-loaded Belgian SME dataset to generate real-time native SVG financial charts.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload Financial File (.CSV / .XML)
          </button>
        )}
        {onLoadDemo && (
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold shadow transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Load Belgian SME Demo Data
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Main Combined Financial Visualizations Section
 */
export default function FinancialVisualizations({
  transactions,
  onUploadClick,
  onLoadDemo
}: FinancialVisualizationsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyVisualizationsPlaceholder
        onUploadClick={onUploadClick}
        onLoadDemo={onLoadDemo}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Visualizations Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Financial Visualizations & Native SVG Analytics
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800/80 text-blue-300 font-mono">
              Pure Native SVG (Zero External Libs)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time graphical breakdown of category allocations and cumulative cash flow trajectory across {transactions.length} transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Ledger: {transactions.length} entries</span>
        </div>
      </div>

      {/* Two Responsive Native SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Native SVG Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Revenue vs. Expenses by Category</h3>
                <p className="text-[11px] text-slate-400">Aggregated spending and revenue distribution</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Native SVG Bars
            </span>
          </div>

          <div className="w-full">
            <CategoryBarChart transactions={transactions} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Hover bars for transaction totals and counts</span>
            <span className="text-emerald-400 font-medium">Green = Revenue · Red = Expenses</span>
          </div>
        </div>

        {/* Chart 2: Native SVG Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <LineChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cash Flow Trend (Cumulative Net Position)</h3>
                <p className="text-[11px] text-slate-400">Chronological net cash trajectory over time</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Interactive Polyline
            </span>
          </div>

          <div className="w-full">
            <CashFlowLineChart transactions={transactions} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Hover over points to inspect transaction values</span>
            <span className="text-cyan-400 font-medium">Responsive ViewBox (0 0 800 400)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
