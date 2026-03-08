import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';
import { EdgeCase } from '../../../shared/types';
import { VoiceAssist } from './VoiceAssist';

interface EdgeCaseReportProps {
  edgeCases: EdgeCase[];
  algorithmType: string;
}

export const EdgeCaseReport: React.FC<EdgeCaseReportProps> = ({ edgeCases, algorithmType }) => {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  const getRiskIcon = (level: EdgeCase['riskLevel']) => {
    switch (level) {
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getRiskColor = (level: EdgeCase['riskLevel']) => {
    switch (level) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getRiskBadgeColor = (level: EdgeCase['riskLevel']) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const overallRiskLevel = () => {
    const highRisk = edgeCases.filter(e => e.riskLevel === 'high').length;
    const mediumRisk = edgeCases.filter(e => e.riskLevel === 'medium').length;
    
    if (highRisk > 0) return { level: 'High Risk', color: 'text-red-600', icon: '🚨' };
    if (mediumRisk > 1) return { level: 'Medium Risk', color: 'text-yellow-600', icon: '⚠️' };
    return { level: 'Low Risk', color: 'text-green-600', icon: '✅' };
  };

  const risk = overallRiskLevel();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Edge Case & Robustness Analysis</h3>
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${risk.color}`}>
            <span className="mr-1">{risk.icon}</span>
            {risk.level}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Voice Assist */}
        <div className="mb-6">
          <VoiceAssist 
            text={`Edge Case Analysis for ${algorithmType}. Found ${edgeCases.length} potential edge cases. ${edgeCases.map(e => `${e.scenario}: ${e.expectedBehavior}. Mitigation: ${e.mitigation}`).join('. ')}`}
          />
        </div>

        {/* Risk Summary */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {edgeCases.filter(e => e.riskLevel === 'high').length}
            </div>
            <div className="text-sm text-red-800">High Risk Issues</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {edgeCases.filter(e => e.riskLevel === 'medium').length}
            </div>
            <div className="text-sm text-yellow-800">Medium Risk Issues</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {edgeCases.filter(e => e.riskLevel === 'low').length}
            </div>
            <div className="text-sm text-green-800">Low Risk Issues</div>
          </div>
        </div>

        {/* Stress Test Scenarios */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-purple-600" />
            Stress Test Scenarios
          </h4>
          
          <div className="space-y-4">
            {edgeCases.map((edgeCase, index) => (
              <div key={index} className={`border rounded-lg overflow-hidden ${getRiskColor(edgeCase.riskLevel)}`}>
                <div 
                  className="p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
                  onClick={() => setSelectedCase(selectedCase === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getRiskIcon(edgeCase.riskLevel)}
                      <h5 className="font-semibold ml-3">{edgeCase.scenario}</h5>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(edgeCase.riskLevel)}`}>
                        {edgeCase.riskLevel.toUpperCase()}
                      </span>
                      <span className="text-sm">
                        {selectedCase === index ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCase === index && (
                  <div className="px-4 pb-4 border-t border-current border-opacity-20">
                    <div className="mt-4 space-y-3">
                      <div>
                        <h6 className="font-medium text-sm mb-1">Test Input:</h6>
                        <code className="bg-white bg-opacity-50 px-2 py-1 rounded text-sm font-mono">
                          {edgeCase.input}
                        </code>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-sm mb-1">Expected Behavior:</h6>
                        <p className="text-sm">{edgeCase.expectedBehavior}</p>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-sm mb-1">Recommended Mitigation:</h6>
                        <p className="text-sm font-medium">{edgeCase.mitigation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Robustness Checklist */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">🛡️ Robustness Checklist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-blue-800">Input validation implemented</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-blue-800">Boundary conditions handled</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-blue-800">Error handling for edge cases</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <XCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-blue-800">Memory overflow protection</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-blue-800">Performance degradation monitoring</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-blue-800">Graceful failure handling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Recommendations */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3">🧪 Testing Recommendations</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Test with empty inputs and single-element datasets</li>
            <li>• Verify behavior with extremely large inputs (stress testing)</li>
            <li>• Test with invalid data types and malformed inputs</li>
            <li>• Measure performance under worst-case scenarios</li>
            <li>• Implement automated tests for all identified edge cases</li>
            <li>• Use property-based testing to discover unknown edge cases</li>
          </ul>
        </div>
      </div>
    </div>
  );
};