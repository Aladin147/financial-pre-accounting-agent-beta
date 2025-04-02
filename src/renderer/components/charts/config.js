/**
 * Chart.js Configuration for Dark Theme
 * 
 * This file provides default configuration options for Chart.js
 * charts that match our dark theme styling.
 */

// Common chart configuration for dark theme
export const getDarkThemeConfig = () => {
  return {
    color: 'rgba(255, 255, 255, 0.7)',
    font: {
      family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            weight: 500
          },
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(33, 33, 33, 0.95)',
        titleColor: 'rgba(255, 255, 255, 0.87)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          weight: 600
        },
        bodyFont: {
          weight: 400
        },
        boxWidth: 10
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          tickBorderDash: [2, 4]
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11
          }
        },
        border: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          tickBorderDash: [2, 4]
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11
          }
        },
        border: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    elements: {
      line: {
        tension: 0.3, // slightly curved lines
        borderWidth: 2
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        borderWidth: 2
      },
      bar: {
        borderWidth: 1
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    responsive: true,
    maintainAspectRatio: false
  };
};

// Financial chart colors for dark theme
export const chartColors = {
  revenue: '#D4B483',      // Mustard for revenue/income
  expense: '#E17F76',      // Soft red for expenses
  profit: '#F7C948',       // Brighter gold for profit
  tax: '#8A6BBE',          // Purple for tax
  gradient: {
    revenue: {
      start: '#D4B483',
      end: 'rgba(212, 180, 131, 0.1)'
    },
    expense: {
      start: '#E17F76',
      end: 'rgba(225, 127, 118, 0.1)'
    },
    profit: {
      start: '#F7C948',
      end: 'rgba(247, 201, 72, 0.1)'
    },
    tax: {
      start: '#8A6BBE', 
      end: 'rgba(138, 107, 190, 0.1)'
    }
  }
};

// Helper to create gradient fills for charts
export const createGradient = (ctx, startColor, endColor) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  return gradient;
};

// Currency formatter for chart values
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Percentage formatter for chart values
export const formatPercentage = (value) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};
