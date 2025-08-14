import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface InvestmentChartProps {
  investedAmount: number;
  estimatedReturns: number;
}

export default function InvestmentChart({ investedAmount, estimatedReturns }: InvestmentChartProps) {
  const data = [
    { name: 'Invested Amount', value: investedAmount, color: '#1565C0' },
    { name: 'Estimated Returns', value: estimatedReturns, color: '#00D09C' }
  ];

  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
      return '₹' + (amount / 100000).toFixed(2) + ' L';
    } else if (amount >= 1000) {
      return '₹' + (amount / 1000).toFixed(0) + 'K';
    } else {
      return '₹' + Math.round(amount).toLocaleString('en-IN');
    }
  };

  const renderCustomizedLabel = () => {
    return null; // Remove labels from the pie chart for cleaner look
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {payload[0].name}: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative" data-testid="chart-investment-breakdown">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[hsl(207,90%,54%)] rounded-full mr-2"></div>
          <span className="text-[hsl(220,8.9%,46.1%)]">Invested</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[hsl(162,100%,41%)] rounded-full mr-2"></div>
          <span className="text-[hsl(220,8.9%,46.1%)]">Returns</span>
        </div>
      </div>
    </div>
  );
}
