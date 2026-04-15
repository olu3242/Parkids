'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ResultsPoint = {
  label: string;
  value: number;
};

type ResultsChartProps = {
  data: ResultsPoint[];
  mode?: 'line' | 'bar' | 'pie';
  valueLabel?: string;
};

const PIE_COLORS = ['#2D7D5A', '#3ABFBF', '#6CC79A', '#F2A65A', '#6B8485'];

export default function ResultsChart({ data, mode = 'line', valueLabel = 'Value' }: ResultsChartProps) {
  let chartEl;

  if (mode === 'bar') {
    chartEl = (
      <BarChart data={data} margin={{ top: 16, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="label" stroke="#486668" fontSize={12} />
        <YAxis stroke="#486668" fontSize={12} />
        <Tooltip formatter={(v) => [v, valueLabel]} />
        <Bar dataKey="value" fill="#3ABFBF" radius={[8, 8, 0, 0]} />
      </BarChart>
    );
  } else if (mode === 'pie') {
    chartEl = (
      <PieChart>
        <Tooltip formatter={(v) => [v, valueLabel]} />
        <Pie data={data} dataKey="value" nameKey="label" outerRadius={96} innerRadius={52}>
          {data.map((entry, index) => (
            <Cell key={`${entry.label}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  } else {
    chartEl = (
      <LineChart data={data} margin={{ top: 16, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="label" stroke="#486668" fontSize={12} />
        <YAxis stroke="#486668" fontSize={12} />
        <Tooltip formatter={(v) => [v, valueLabel]} />
        <Line type="monotone" dataKey="value" stroke="#2D7D5A" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    );
  }

  return (
    <div className="h-72 w-full rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">{chartEl}</ResponsiveContainer>
    </div>
  );
}
