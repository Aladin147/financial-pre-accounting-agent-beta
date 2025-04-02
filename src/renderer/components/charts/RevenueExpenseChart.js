import React, { useRef, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getDarkThemeConfig, chartColors, createGradient, formatCurrency } from './config';

// Register required Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend
);

/**
 * Revenue vs Expenses Chart Component
 * 
 * A bar chart that compares revenue and expenses over a period of time,
 * with an optional net profit line chart overlay.
 * 
 * @param {Object} props Component props
 * @param {Array} props.data Array of data objects containing revenue and expense values
 * @param {Array} props.labels Array of labels for the x-axis
 * @param {Object} props.options Additional options for the chart
 */
const RevenueExpenseChart = ({ data, labels, options = {} }) => {
  const chartRef = useRef(null);
  
  // Only calculate data if we have valid inputs
  if (!data || !data.revenue || !data.expenses || !labels) {
    return (
      <div className="chart-container chart-error">
        <p>No data available for chart</p>
      </div>
    );
  }

  // Process data
  const revenueData = data.revenue;
  const expenseData = data.expenses;
  
  // Calculate net profit if available
  const showNetProfit = options.showNetProfit !== false;
  const netProfitData = showNetProfit 
    ? revenueData.map((rev, index) => rev - (expenseData[index] || 0))
    : [];

  // Create chart data
  const chartData = {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        label: 'Revenue',
        data: revenueData,
        backgroundColor: chartColors.revenue,
        borderColor: chartColors.revenue,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        type: 'bar',
        label: 'Expenses',
        data: expenseData,
        backgroundColor: chartColors.expense,
        borderColor: chartColors.expense,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      }
    ]
  };

  // Add net profit line if enabled
  if (showNetProfit) {
    chartData.datasets.push({
      type: 'line',
      label: 'Net Profit',
      data: netProfitData,
      borderColor: chartColors.profit,
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: chartColors.profit,
      pointBorderColor: '#fff',
      pointRadius: 3,
      pointHoverRadius: 5,
      yAxisID: 'y1', // Use secondary y-axis
    });
  }

  // Get base configuration for dark theme
  const baseConfig = getDarkThemeConfig();
  
  // Customize for this specific chart
  const chartOptions = {
    ...baseConfig,
    plugins: {
      ...baseConfig.plugins,
      title: {
        display: options.title ? true : false,
        text: options.title || '',
        color: 'rgba(255, 255, 255, 0.87)',
        font: {
          size: 16,
          weight: 600
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        ...baseConfig.plugins.tooltip,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      ...baseConfig.scales,
      y: {
        ...baseConfig.scales.y,
        title: {
          display: true,
          text: 'Amount (MAD)',
          color: 'rgba(255, 255, 255, 0.6)'
        },
        ticks: {
          ...baseConfig.scales.y.ticks,
          callback: function(value) {
            if (value >= 1000000) {
              return value / 1000000 + 'M';
            } else if (value >= 1000) {
              return value / 1000 + 'K';
            }
            return value;
          }
        }
      }
    }
  };

  // Add secondary y-axis for net profit if shown
  if (showNetProfit) {
    chartOptions.scales.y1 = {
      ...chartOptions.scales.y,
      display: false,
      grid: {
        drawOnChartArea: false
      }
    };
  }

  // Apply gradient fills if context is available
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const revenueGradient = createGradient(
        ctx, 
        chartColors.gradient.revenue.start,
        chartColors.gradient.revenue.end
      );
      
      const expenseGradient = createGradient(
        ctx, 
        chartColors.gradient.expense.start,
        chartColors.gradient.expense.end
      );
      
      // Update datasets with gradients
      if (chart.data.datasets[0] && chart.data.datasets[1]) {
        chart.data.datasets[0].backgroundColor = revenueGradient;
        chart.data.datasets[1].backgroundColor = expenseGradient;
        chart.update();
      }
    }
  }, []);

  return (
    <div className="chart-container revenue-expense-chart">
      <Bar ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
};

export default RevenueExpenseChart;
