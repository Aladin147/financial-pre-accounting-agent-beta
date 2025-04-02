import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getDarkThemeConfig, chartColors } from './config';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Document Distribution Chart Component
 * 
 * A doughnut chart that visualizes the distribution of documents
 * by category (incoming/outgoing) or document type.
 * 
 * @param {Object} props Component props
 * @param {Array} props.data Object containing document distribution data
 * @param {string} props.chartType 'category' or 'type' to determine what to visualize
 * @param {Object} props.options Additional options for the chart
 */
const DocumentDistributionChart = ({ data, chartType = 'category', options = {} }) => {
  // Default colors for different document types
  const defaultColors = [
    chartColors.revenue,    // For outgoing/revenue documents
    chartColors.expense,    // For incoming/expense documents
    chartColors.tax,        // For tax-related documents 
    '#74b9ff',             // Blue for contracts
    '#00b894',             // Green for misc
    '#a29bfe',             // Purple
    '#fd79a8'              // Pink
  ];
  
  // Define lighter border versions of the colors
  const borderColors = defaultColors.map(color => {
    // For hex colors, lighten them slightly for borders
    if (color.startsWith('#')) {
      // Simple lightening by adding transparency
      return color + '88'; // Add 50% alpha
    }
    return color;
  });

  // Only calculate data if we have valid inputs
  if (!data || !data.labels || !data.values) {
    return (
      <div className="chart-container chart-error">
        <p>No data available for chart</p>
      </div>
    );
  }

  // Create chart data
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: options.colors || defaultColors.slice(0, data.labels.length),
        borderColor: options.borderColors || borderColors.slice(0, data.labels.length),
        borderWidth: 1,
        hoverOffset: 15
      }
    ]
  };

  // Get base configuration for dark theme
  const baseConfig = getDarkThemeConfig();
  
  // Customize for this specific chart
  const chartOptions = {
    ...baseConfig,
    cutout: '60%', // Make it a donut chart
    radius: '90%',
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
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      legend: {
        ...baseConfig.plugins.legend,
        position: 'right',
        align: 'center',
        labels: {
          ...baseConfig.plugins.legend.labels,
          padding: 15,
          generateLabels: (chart) => {
            // Get the default labels
            const original = ChartJS.overrides.pie.plugins.legend.labels.generateLabels(chart);
            
            // Add counts and percentages to labels
            return original.map((label, i) => {
              const value = chart.data.datasets[0].data[i];
              const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              
              label.text = `${label.text} (${percentage}%)`;
              return label;
            });
          }
        }
      }
    }
  };

  // Create center text if provided
  const centerText = options.centerText || null;
  const renderCenterText = centerText && (
    <div className="donut-center-text">
      <div className="center-value">{centerText.value}</div>
      <div className="center-label">{centerText.label}</div>
    </div>
  );

  return (
    <div className={`chart-container document-distribution-chart ${chartType}`}>
      <Doughnut data={chartData} options={chartOptions} />
      {renderCenterText}
    </div>
  );
};

export default DocumentDistributionChart;
