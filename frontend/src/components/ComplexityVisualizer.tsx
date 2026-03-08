import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Clock, Database, AlertTriangle } from 'lucide-react';
import { ComplexityAnalysis } from '../../../shared/types';
import { VoiceAssist } from './VoiceAssist';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ComplexityVisualizerProps {
  analysis: ComplexityAnalysis;
  algorithmType: string;
}

export const ComplexityVisualizer: React.FC<ComplexityVisualizerProps> = ({
  analysis,
  algorithmType
}) => {
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Algorithm Complexity Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed?.y;
            const inputSize = context.parsed?.x;
            if (value !== null && value !== undefined && inputSize !== null && inputSize !== undefined) {
              return `${label}: ${value.toFixed(2)} operations for input size ${inputSize}`;
            }
            return `${label}: No data`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Input Size (n)',
          font: {
            weight: 'bold'
          }
        },
        type: 'linear'
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Number of Operations',
          font: {
            weight: 'bold'
          }
        },
        beginAtZero: true
      },
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8
      },
      line: {
        tension: 0.1
      }
    }
  };

  const chartData = {
    labels: analysis.comparisonData.input_size,
    datasets: [
      {
        label: `Your Algorithm (${analysis.timeComplexity})`,
        data: analysis.comparisonData.current_algorithm,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Optimal (O(log n))',
        data: analysis.comparisonData.optimal_algorithm,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Linear (O(n))',
        data: analysis.comparisonData.input_size,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ],
  };

  const getComplexityColor = (complexity: string) => {
    if (complexity.includes('log n')) return 'text-green-600 bg-green-50 border-green-200';
    if (complexity.includes('n²') || complexity.includes('n^2')) return 'text-red-600 bg-red-50 border-red-200';
    if (complexity.includes('n log n')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getPerformanceRating = (complexity: string) => {
    if (complexity.includes('log n')) return { rating: 'Excellent', icon: '🚀', color: 'text-green-600' };
    if (complexity.includes('n log n')) return { rating: 'Good', icon: '✅', color: 'text-yellow-600' };
    if (complexity.includes('n²') || complexity.includes('n^2')) return { rating: 'Poor', icon: '⚠️', color: 'text-red-600' };
    return { rating: 'Fair', icon: '👍', color: 'text-blue-600' };
  };

  const performance = getPerformanceRating(analysis.timeComplexity);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Computational Complexity Analysis</h3>
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${performance.color}`}>
            <span className="mr-1">{performance.icon}</span>
            {performance.rating}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Voice Assist */}
        <div className="mb-6">
          <VoiceAssist 
            text={`Complexity Analysis for ${algorithmType}. Time Complexity: ${analysis.timeComplexity}. Space Complexity: ${analysis.spaceComplexity}. Real World Impact: ${analysis.realWorldImpact}`}
          />
        </div>

        {/* Complexity Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${getComplexityColor(analysis.timeComplexity)}`}>
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 mr-2" />
              <h4 className="font-semibold">Time Complexity</h4>
            </div>
            <div className="text-2xl font-bold font-mono mb-1">{analysis.timeComplexity}</div>
            <p className="text-sm opacity-80">Operations per input size</p>
          </div>

          <div className={`p-4 rounded-lg border ${getComplexityColor(analysis.spaceComplexity)}`}>
            <div className="flex items-center mb-2">
              <Database className="w-5 h-5 mr-2" />
              <h4 className="font-semibold">Space Complexity</h4>
            </div>
            <div className="text-2xl font-bold font-mono mb-1">{analysis.spaceComplexity}</div>
            <p className="text-sm opacity-80">Memory usage growth</p>
          </div>
        </div>

        {/* Complexity Chart */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Real-World Impact */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">Real-World Performance Impact</h4>
              <p className="text-orange-800 leading-relaxed">{analysis.realWorldImpact}</p>
            </div>
          </div>
        </div>

        {/* Complexity Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Input Size</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Your Algorithm</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Optimal (O(log n))</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Efficiency Ratio</th>
              </tr>
            </thead>
            <tbody>
              {analysis.comparisonData.input_size.map((size, index) => {
                const currentOps = analysis.comparisonData.current_algorithm[index];
                const optimalOps = analysis.comparisonData.optimal_algorithm[index];
                const ratio = (currentOps / optimalOps).toFixed(1);
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-sm font-mono">{size.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-mono text-red-600">
                      {currentOps.toFixed(0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-mono text-green-600">
                      {optimalOps.toFixed(0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parseFloat(ratio) > 10 ? 'bg-red-100 text-red-800' :
                        parseFloat(ratio) > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ratio}x slower
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Optimization Suggestions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">💡 Optimization Opportunities</h4>
          <div className="space-y-2 text-sm text-blue-800">
            {analysis.timeComplexity.includes('n²') && (
              <div>• Consider using divide-and-conquer approaches to reduce to O(n log n)</div>
            )}
            {analysis.timeComplexity.includes('n') && !analysis.timeComplexity.includes('log') && (
              <div>• Look for opportunities to use binary search or hash tables for O(log n) or O(1) lookups</div>
            )}
            {analysis.spaceComplexity.includes('n') && (
              <div>• Consider in-place algorithms to reduce space complexity to O(1)</div>
            )}
            <div>• Profile your code with large datasets to identify bottlenecks</div>
            <div>• Consider the trade-offs between time and space complexity for your use case</div>
          </div>
        </div>
      </div>
    </div>
  );
};