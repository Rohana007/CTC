import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Loader2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '../services/api';

interface VisionUploadProps {
  onCodeExtracted: (code: string, language: string) => void;
}

interface AnalysisResult {
  digitizedContent: string;
  visualInsights: string;
  educationalBreakdown: string;
  confidenceScore: number;
  detectedLanguage: string;
  corrections: string[];
  warnings: string[];
}

export const VisionUpload: React.FC<VisionUploadProps> = ({ onCodeExtracted }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setError(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError(null);

    try {
      const data: AnalysisResult = await apiClient.post('/api/vision/analyze', {
        image: selectedImage,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUseCode = () => {
    if (result) {
      onCodeExtracted(result.digitizedContent, result.detectedLanguage);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Camera className="w-5 h-5 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Vision & Multimodal Input</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Upload photos of handwritten code, diagrams, or textbook pages for instant digitization and analysis.
      </p>

      {/* Upload Area */}
      {!selectedImage && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="vision-upload"
          />
          <label htmlFor="vision-upload" className="cursor-pointer">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">Click to upload or drag image</p>
            <p className="text-sm text-gray-500">Supports: Handwritten code, diagrams, whiteboard photos</p>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG (Max 10MB)</p>
          </label>
        </div>
      )}

      {/* Image Preview */}
      {selectedImage && !result && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Uploaded"
              className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={analyzeImage}
            disabled={analyzing}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Image...</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>Analyze Image</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4">
          {/* Image Thumbnail */}
          <div className="relative">
            <img
              src={selectedImage!}
              alt="Analyzed"
              className="w-full max-h-48 object-contain rounded-lg border border-gray-300"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Confidence Score</span>
            </div>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${result.confidenceScore}%` }}
                />
              </div>
              <span className="font-bold text-green-600">{result.confidenceScore}%</span>
            </div>
          </div>

          {/* Detected Language */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              Detected Language: <span className="font-bold">{result.detectedLanguage}</span>
            </span>
          </div>

          {/* Digitized Content */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
              <h4 className="font-semibold text-gray-900">📝 Digitized Content</h4>
            </div>
            <div className="p-4">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {result.digitizedContent}
              </pre>
            </div>
          </div>

          {/* Visual Insights */}
          {result.visualInsights && (
            <div className="border border-purple-300 rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-2 border-b border-purple-300">
                <h4 className="font-semibold text-purple-900">👁️ Visual Insights</h4>
              </div>
              <div className="p-4 bg-white">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.visualInsights}</p>
              </div>
            </div>
          )}

          {/* Educational Breakdown */}
          {result.educationalBreakdown && (
            <div className="border border-blue-300 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 border-b border-blue-300">
                <h4 className="font-semibold text-blue-900">🎓 Educational Breakdown</h4>
              </div>
              <div className="p-4 bg-white">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.educationalBreakdown}</p>
              </div>
            </div>
          )}

          {/* Corrections */}
          {result.corrections && result.corrections.length > 0 && (
            <div className="border border-yellow-300 rounded-lg overflow-hidden">
              <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-300">
                <h4 className="font-semibold text-yellow-900">⚠️ Post-Processing Corrections</h4>
              </div>
              <div className="p-4 bg-white">
                <ul className="list-disc list-inside space-y-1">
                  {result.corrections.map((correction, index) => (
                    <li key={index} className="text-yellow-800">{correction}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="border border-orange-300 rounded-lg overflow-hidden">
              <div className="bg-orange-50 px-4 py-2 border-b border-orange-300">
                <h4 className="font-semibold text-orange-900">🔍 Clarifications Needed</h4>
              </div>
              <div className="p-4 bg-white">
                <ul className="list-disc list-inside space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="text-orange-800">{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUseCode}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Use This Code</span>
            </button>
            <button
              onClick={clearImage}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Upload New Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
