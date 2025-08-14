import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GrowthChartProps {
  data: Array<{
    year: number;
    invested: number;
    totalValue: number;
  }>;
}

export default function GrowthChart({ data }: GrowthChartProps) {
  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
    } else if (amount >= 100000) {
      return '₹' + (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) {
      return '₹' + (amount / 1000).toFixed(0) + 'K';
    } else {
      return '₹' + Math.round(amount).toLocaleString('en-IN');
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{`Year ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartData = data.map(item => ({
    year: `Year ${item.year}`,
    'Invested Amount': item.invested,
    'Total Value': item.totalValue
  }));

  return (
    <div className="w-full" data-testid="chart-growth-over-time">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="year" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Invested Amount" 
            stroke="#1565C0" 
            strokeWidth={3}
            dot={{ fill: '#1565C0', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#1565C0' }}
          />
          <Line 
            type="monotone" 
            dataKey="Total Value" 
            stroke="#00D09C" 
            strokeWidth={3}
            dot={{ fill: '#00D09C', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#00D09C' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
