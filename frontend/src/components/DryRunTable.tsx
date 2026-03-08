import React, { useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { DryRunStep } from '../../../shared/types';

interface DryRunTableProps {
  steps: DryRunStep[];
  algorithmType: string;
}

export const DryRunTable: React.FC<DryRunTableProps> = ({ steps, algorithmType }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getConditionIcon = (state: boolean | null) => {
    if (state === null) return <span className="text-gray-400">—</span>;
    return state ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const formatVariableChanges = (changes: { [key: string]: any }) => {
    return Object.entries(changes).map(([key, value]) => (
      <div key={key} className="text-xs">
        <span className="font-mono text-blue-600">{key}</span>
        <span className="text-gray-500"> = </span>
        <span className="font-mono text-green-600">
          {Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}
        </span>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Play className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Dynamic Execution Trace</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Playback Controls */}
        <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlay}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isPlaying 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={handleStepForward}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Step
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Highlight */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Current Step Explanation</h4>
          <p className="text-blue-800">{steps[currentStep]?.explanation}</p>
        </div>

        {/* Execution Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Step #
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Active Line
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Variable Changes
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Condition State
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Output
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, index) => (
                <tr 
                  key={index}
                  className={`transition-colors ${
                    index === currentStep 
                      ? 'bg-yellow-50 border-yellow-300' 
                      : index < currentStep 
                        ? 'bg-green-50' 
                        : 'bg-white'
                  }`}
                >
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === currentStep 
                        ? 'bg-yellow-500 text-white' 
                        : index < currentStep 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.step}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">
                      Line {step.activeLine}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <div className="space-y-1">
                      {formatVariableChanges(step.variableChanges)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-center">
                    {getConditionIcon(step.conditionState)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    {step.output && (
                      <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                        {step.output}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Algorithm Insights */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2">🔍 Execution Insights</h4>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• Total execution steps: {steps.length}</li>
            <li>• Algorithm type: {algorithmType}</li>
            <li>• Variable state changes tracked in real-time</li>
            <li>• Condition evaluations shown with visual indicators</li>
          </ul>
        </div>
      </div>
    </div>
  );
};