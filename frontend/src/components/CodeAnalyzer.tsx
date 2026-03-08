import React, { useState } from 'react';
import { Code, Loader2, AlertTriangle, Moon, Sun, Camera, Mic, Zap, CheckCircle2 } from 'lucide-react';
import { EnhancedCodeAnalysisResponse } from '../../../shared/types';
import { CodeComplexityMeter } from './CodeComplexityMeter';
import { BestPracticesSuggestions } from './BestPracticesSuggestions';
import { LogicFirstExplanation } from './LogicFirstExplanation';
import { DryRunTable } from './DryRunTable';
import { ComplexityVisualizer } from './ComplexityVisualizer';
import { EdgeCaseReport } from './EdgeCaseReport';
import { KnowledgeCheckQuiz } from './KnowledgeCheckQuiz';
import { VisionUpload } from './VisionUpload';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../services/api';

export const CodeAnalyzer: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<EnhancedCodeAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showIterativeView, setShowIterativeView] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'logic' | 'dryrun' | 'complexity' | 'edges' | 'quiz'>('analysis');
  const [showVisionUpload, setShowVisionUpload] = useState(false);
  
  const { t, language: uiLanguage } = useLanguage();
  
  const { isListening, transcript, error: voiceError, startListening, stopListening } = useVoiceInput({
    language: uiLanguage === 'hi' ? 'hi-IN' : 'en-US',
    onResult: (result) => {
      setCode(prev => prev + ' ' + result);
    }
  });

  const handleCodeExtracted = (extractedCode: string, detectedLanguage: string) => {
    setCode(extractedCode);
    setLanguage(detectedLanguage);
    setShowVisionUpload(false);
  };

  const supportedLanguages = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'c', name: 'C' }
  ];

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post('/api/code-analysis/analyze', {
        code: code.trim(),
        language,
      });
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze code');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleCode = () => {
    const sampleCodes = {
      python: `def find_duplicates(numbers):
    seen = set()
    duplicates = []
    
    for num in numbers:
        if num in seen:
            duplicates.append(num)
        else:
            seen.add(num)
    
    return duplicates

# Example with potential improvements
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Test the functions
numbers = [1, 2, 3, 2, 4, 5, 3]
print("Duplicates:", find_duplicates(numbers))
print("Sorted:", bubble_sort([64, 34, 25, 12, 22, 11, 90]))`,
      
      javascript: `var users = [];

function addUser(name, email) {
    var user = {
        id: users.length + 1,
        name: name,
        email: email,
        createdAt: new Date()
    };
    
    users.push(user);
    return user;
}

function findUserByEmail(email) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            return users[i];
        }
    }
    return null;
}

// Usage example
addUser("John Doe", "john@example.com");
addUser("Jane Smith", "jane@example.com");
console.log(findUserByEmail("john@example.com"));`,

      java: `public class Calculator {
    
    public static int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
    
    public static boolean isPrime(int num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 == 0 || num % 3 == 0) return false;
        
        for (int i = 5; i * i <= num; i += 6) {
            if (num % i == 0 || num % (i + 2) == 0) {
                return false;
            }
        }
        return true;
    }
    
    public static void main(String[] args) {
        System.out.println("Factorial of 5: " + factorial(5));
        System.out.println("Is 17 prime? " + isPrime(17));
    }
}`,

      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

class NumberProcessor {
private:
    std::vector<int> numbers;
    
public:
    void addNumber(int num) {
        numbers.push_back(num);
    }
    
    int findMax() {
        if (numbers.empty()) {
            return -1;
        }
        
        int max = numbers[0];
        for (int i = 1; i < numbers.size(); i++) {
            if (numbers[i] > max) {
                max = numbers[i];
            }
        }
        return max;
    }
    
    void sortNumbers() {
        std::sort(numbers.begin(), numbers.end());
    }
    
    void printNumbers() {
        for (int num : numbers) {
            std::cout << num << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    NumberProcessor processor;
    processor.addNumber(5);
    processor.addNumber(2);
    processor.addNumber(8);
    processor.addNumber(1);
    
    std::cout << "Max: " << processor.findMax() << std::endl;
    processor.sortNumbers();
    processor.printNumbers();
    
    return 0;
}`,

      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[50];
    int age;
    float salary;
} Employee;

void printEmployee(Employee emp) {
    printf("Name: %s, Age: %d, Salary: %.2f\\n", 
           emp.name, emp.age, emp.salary);
}

int compareEmployees(const void *a, const void *b) {
    Employee *empA = (Employee *)a;
    Employee *empB = (Employee *)b;
    return (empA->salary > empB->salary) - (empA->salary < empB->salary);
}

int main() {
    Employee employees[3];
    
    strcpy(employees[0].name, "Alice");
    employees[0].age = 30;
    employees[0].salary = 50000.0;
    
    strcpy(employees[1].name, "Bob");
    employees[1].age = 25;
    employees[1].salary = 45000.0;
    
    strcpy(employees[2].name, "Charlie");
    employees[2].age = 35;
    employees[2].salary = 60000.0;
    
    printf("Before sorting:\\n");
    for (int i = 0; i < 3; i++) {
        printEmployee(employees[i]);
    }
    
    qsort(employees, 3, sizeof(Employee), compareEmployees);
    
    printf("\\nAfter sorting by salary:\\n");
    for (int i = 0; i < 3; i++) {
        printEmployee(employees[i]);
    }
    
    return 0;
}`
    };
    
    const selectedCode = sampleCodes[language as keyof typeof sampleCodes] || sampleCodes.python;
    setCode(selectedCode);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Demo Mode Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎓</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Advanced Pedagogical Analysis Mode</h3>
            <p className="text-sm text-blue-700">
              Deep learning analysis with logic explanations, dry-run simulation, and knowledge verification. Try Python algorithms for full analysis!
            </p>
          </div>
        </div>
      </div>

      {/* Input Section - Dark Theme */}
      <div className="glass-card-violet p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg">
              <Code className="w-6 h-6 text-purple-400 neon-icon" />
            </div>
            <h2 className="text-xl font-bold text-white">Advanced Code Analyzer</h2>
          </div>
          
          {/* iOS-Style Toggle Controls */}
          <div className="flex items-center space-x-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-400">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  darkMode
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                    : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center ${
                    darkMode ? 'transform translate-x-7' : ''
                  }`}
                >
                  {darkMode ? (
                    <Moon className="w-3 h-3 text-indigo-600" />
                  ) : (
                    <Sun className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
              </button>
            </div>
            
            {/* Iterative View Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-400">Iterative View</span>
              <button
                onClick={() => setShowIterativeView(!showIterativeView)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  showIterativeView
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                    showIterativeView ? 'transform translate-x-7' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Programming Language
          </label>
          <div className="flex flex-wrap gap-2">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  language === lang.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white neon-glow-blue'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                disabled={loading}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Code Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-400">
              Your Code
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadSampleCode}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg text-sm font-medium transition-all"
                disabled={loading}
              >
                Load Sample
              </button>
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-purple-600/20 to-violet-600/20 text-purple-400 border border-purple-500/30 hover:from-purple-600/30 hover:to-violet-600/30'
                }`}
                disabled={loading}
              >
                <Mic className="w-4 h-4" />
                <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
              </button>
              <button
                onClick={() => setShowVisionUpload(!showVisionUpload)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 text-cyan-400 rounded-lg text-sm font-medium transition-all border border-cyan-500/30 flex items-center space-x-2"
                disabled={loading}
              >
                <Camera className="w-4 h-4" />
                <span>Upload Image</span>
                {showVisionUpload ? 'Hide' : t('code.uploadImage')}
              </button>
              <button
                onClick={loadSampleCode}
                className="text-sm text-primary-600 hover:text-primary-700"
                disabled={loading}
              >
                {t('code.loadSample')}
              </button>
            </div>
          </div>

          {/* Voice Input Error Display */}
          {voiceError && (
            <div className="mb-4 bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-200">{voiceError}</p>
              </div>
            </div>
          )}

          {/* Vision Upload Section */}
          {showVisionUpload && (
            <div className="mb-4">
              <VisionUpload onCodeExtracted={handleCodeExtracted} />
            </div>
          )}
          
          {/* AI Readiness Indicator - Pulsing Blue Line */}
          <div className={`h-1 mb-4 ${loading ? 'bg-yellow-500/50' : 'ai-ready-pulse'}`} />
          
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here or load a sample..."
              className="w-full h-96 bg-[#272822] text-[#f8f8f2] font-mono text-sm p-6 rounded-xl border border-purple-500/30 focus:border-purple-500/50 focus:outline-none resize-none monokai-editor"
              disabled={loading}
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: '1.6',
                tabSize: 4
              }}
            />
            {isListening && transcript && (
              <div className="absolute bottom-4 right-4 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-lg text-sm border border-purple-500/30">
                {transcript}
              </div>
            )}
            {code.length > 0 && (
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-purple-500/30">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">{code.split('\n').length} lines</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleAnalyze}
            disabled={loading || !code.trim()}
            className="btn-saas-large px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 text-lg font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
          {code.trim() && (
            <button
              onClick={() => setCode('')}
              className="px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-xl text-lg font-medium transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card border-red-500/30 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-400">Analysis Error</h4>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex space-x-2 bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl overflow-x-auto">
            <nav className="flex space-x-2" aria-label="Tabs">
                {[
                  { id: 'analysis', name: 'Code Analysis', icon: '📊' },
                  { id: 'logic', name: 'Logic Explanation', icon: '🧠', disabled: !analysis.pedagogicalAnalysis },
                  { id: 'dryrun', name: 'Dry Run', icon: '▶️', disabled: !analysis.pedagogicalAnalysis },
                  { id: 'complexity', name: 'Complexity', icon: '📈', disabled: !analysis.pedagogicalAnalysis },
                  { id: 'edges', name: 'Edge Cases', icon: '🛡️', disabled: !analysis.pedagogicalAnalysis },
                  { id: 'quiz', name: 'Knowledge Check', icon: '🎯', disabled: !analysis.pedagogicalAnalysis }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    disabled={tab.disabled}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white neon-glow-blue'
                        : tab.disabled
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

          {/* Tab Content */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Existing analysis content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Code Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                      <div className="text-2xl font-bold text-blue-400">{code.split('\n').length}</div>
                      <div className="text-sm text-gray-400">Total Lines</div>
                    </div>
                    <div className="text-center p-3 bg-green-600/20 rounded-lg border border-green-500/30">
                      <div className="text-2xl font-bold text-green-400">
                        {code.split('\n').filter(line => line.trim().length > 0).length}
                      </div>
                      <div className="text-sm text-gray-400">Code Lines</div>
                    </div>
                    <div className="text-center p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-400">{code.length}</div>
                      <div className="text-sm text-gray-400">Characters</div>
                    </div>
                    <div className="text-center p-3 bg-orange-600/20 rounded-lg border border-orange-500/30">
                      <div className="text-2xl font-bold text-orange-400">
                        {(code.match(/function|def |class |public |private/g) || []).length}
                      </div>
                      <div className="text-sm text-gray-400">Functions/Classes</div>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Complexity Analysis</h3>
                  <CodeComplexityMeter code={code} language={language} />
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Code Summary</h3>
                <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
              </div>

              <BestPracticesSuggestions 
                language={language} 
                code={code} 
                issues={analysis.issues || []} 
              />
            </div>
          )}

          {/* Pedagogical Analysis Tabs */}
          {analysis.pedagogicalAnalysis && (
            <>
              {activeTab === 'logic' && (
                <LogicFirstExplanation
                  explanations={analysis.pedagogicalAnalysis.logicExplanations}
                  coreLogic={analysis.pedagogicalAnalysis.coreLogic}
                  algorithmType={analysis.pedagogicalAnalysis.algorithmType}
                />
              )}

              {activeTab === 'dryrun' && (
                <DryRunTable
                  steps={analysis.pedagogicalAnalysis.dryRunTable}
                  algorithmType={analysis.pedagogicalAnalysis.algorithmType}
                />
              )}

              {activeTab === 'complexity' && (
                <ComplexityVisualizer
                  analysis={analysis.pedagogicalAnalysis.complexityAnalysis}
                  algorithmType={analysis.pedagogicalAnalysis.algorithmType}
                />
              )}

              {activeTab === 'edges' && (
                <EdgeCaseReport
                  edgeCases={analysis.pedagogicalAnalysis.edgeCases}
                  algorithmType={analysis.pedagogicalAnalysis.algorithmType}
                />
              )}

              {activeTab === 'quiz' && (
                <KnowledgeCheckQuiz
                  questions={analysis.pedagogicalAnalysis.knowledgeCheck}
                  algorithmType={analysis.pedagogicalAnalysis.algorithmType}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};