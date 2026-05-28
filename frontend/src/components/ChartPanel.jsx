import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

export default function ChartPanel({ chartType, labels, data, title, colors }) {
  const chartData = {
    labels,
    datasets: [{
      label: title,
      data,
      backgroundColor: colors,
      borderColor: colors,
      borderWidth: 2,
      fill: chartType !== 'bar',
      tension: 0.4,
      borderRadius: chartType === 'bar' ? 5 : 0,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: chartType === 'doughnut', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 11 }, padding: 10 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: chartType === 'doughnut' ? {} : {
      x: { grid: { color: 'rgba(148,163,184,0.07)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(148,163,184,0.07)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
    },
    cutout: chartType === 'doughnut' ? '65%' : undefined,
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 backdrop-blur-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="h-44">
        {chartType === 'bar'      && <Bar      data={chartData} options={options} />}
        {chartType === 'line'     && <Line     data={chartData} options={options} />}
        {chartType === 'doughnut' && <Doughnut data={chartData} options={options} />}
      </div>
    </div>
  )
}
