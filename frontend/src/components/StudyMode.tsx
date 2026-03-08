import React, { useState } from 'react';
import { BookOpen, Brain, Lightbulb, Trophy, Target, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { StudyDashboard } from './StudyDashboard';

interface StudyModeProps {
  isActive: boolean;
  onToggle: () => void;
}

interface HomeworkProblem {
  id: string;
  problem: string;
  coreConceptsIdentified: string[];
  currentStep: number;
  hintsUsed: { bronze: number; silver: number; gold: number };
  completed: boolean;
}

interface StudySession {
  masteredConcepts: string[];
  reviewNeeded: string[];
  hintsUsed: number;
  problemsSolved: number;
  xpEarned: number;
}

export const StudyMode: React.FC<StudyModeProps> = ({ isActive, onToggle }) => {
  const [showDashboard, setShowDashboard] = useState(true);
  const [currentProblem, setCurrentProblem] = useState<HomeworkProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentHintLevel, setCurrentHintLevel] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [showSimilarProblem, setShowSimilarProblem] = useState(false);
  const [studySession, setStudySession] = useState<StudySession>({
    masteredConcepts: ['Arrays', 'Loops', 'Functions', 'Recursion', 'Binary Search'],
    reviewNeeded: ['Dynamic Programming', 'Graph Algorithms'],
    hintsUsed: 12,
    problemsSolved: 24,
    xpEarned: 3450
  });

  // Mock stats for dashboard
  const dashboardStats = {
    conceptsMastered: studySession.masteredConcepts.length,
    totalConcepts: studySession.masteredConcepts.length + studySession.reviewNeeded.length + 10,
    problemsSolved: studySession.problemsSolved,
    totalProblems: 50,
    studyStreak: 7,
    xpEarned: studySession.xpEarned,
    hintsUsed: studySession.hintsUsed,
    accuracy: 85
  };

  if (showDashboard) {
    return (
      <div className="space-y-6">
        <StudyDashboard stats={dashboardStats} />
        
        <div className="flex justify-center">
          <button
            onClick={() => setShowDashboard(false)}
            className="btn-saas px-8 py-3"
          >
            Start Practice Session
          </button>
        </div>
      </div>
    );
  }

  const handleStartProblem = (problemText: string) => {
    const newProblem: HomeworkProblem = {
      id: Date.now().toString(),
      problem: problemText,
      coreConceptsIdentified: ['Binary Search', 'Divide and Conquer', 'Array Manipulation'],
      currentStep: 1,
      hintsUsed: { bronze: 0, silver: 0, gold: 0 },
      completed: false
    };
    setCurrentProblem(newProblem);
    setCurrentHintLevel(null);
    setUserAnswer('');
  };

  const handleRequestHint = (level: 'bronze' | 'silver' | 'gold') => {
    if (currentProblem) {
      const updated = { ...currentProblem };
      updated.hintsUsed[level]++;
      setCurrentProblem(updated);
      setCurrentHintLevel(level);
      setStudySession(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    }
  };

  const handleSubmitAnswer = () => {
    if (currentProblem) {
      // Simulate answer checking
      const isCorrect = userAnswer.toLowerCase().includes('binary') || userAnswer.toLowerCase().includes('divide');
      
      if (isCorrect) {
        setStudySession(prev => ({
          ...prev,
          masteredConcepts: [...prev.masteredConcepts, ...currentProblem.coreConceptsIdentified],
          problemsSolved: prev.problemsSolved + 1,
          xpEarned: prev.xpEarned + (50 - (currentProblem.hintsUsed.bronze * 5 + currentProblem.hintsUsed.silver * 10 + currentProblem.hintsUsed.gold * 15))
        }));
        setCurrentProblem({ ...currentProblem, completed: true });
      } else {
        setStudySession(prev => ({
          ...prev,
          reviewNeeded: [...prev.reviewNeeded, currentProblem.coreConceptsIdentified[0]]
        }));
      }
    }
  };

  const getHintContent = (level: 'bronze' | 'silver' | 'gold') => {
    const hints = {
      bronze: {
        title: '🥉 Bronze Hint - Conceptual Direction',
        content: 'This problem is about searching in a sorted array. Think about how you can eliminate half of the search space in each step.',
        xpCost: 5
      },
      silver: {
        title: '🥈 Silver Hint - Approach Guidance',
        content: 'Use two pointers (left and right) to track the search boundaries. Calculate the middle index and compare the middle element with your target.',
        xpCost: 10
      },
      gold: {
        title: '🥇 Gold Hint - Implementation Detail',
        content: 'Initialize left=0 and right=len(arr)-1. In a loop, calculate mid=(left+right)//2. If arr[mid]==target, return mid. If arr[mid]<target, set left=mid+1, else set right=mid-1.',
        xpCost: 15
      }
    };
    return hints[level];
  };

  return (
    <div className="space-y-6">
      {/* Study Mode Toggle */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Study Mode</h3>
              <p className="text-sm text-gray-600">Guided learning with Socratic questioning</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {isActive && (
        <>
          {/* Current Session Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{studySession.xpEarned}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">XP Earned</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{studySession.problemsSolved}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Problems Solved</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">{studySession.hintsUsed}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Hints Used</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">{studySession.masteredConcepts.length}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Concepts Mastered</p>
            </div>
          </div>

          {/* Problem Input */}
          {!currentProblem && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 text-indigo-600 mr-2" />
                Start a Homework Problem
              </h3>
              <textarea
                placeholder="Paste your homework problem here... (e.g., 'Implement binary search to find a target value in a sorted array')"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    handleStartProblem(e.target.value);
                  }
                }}
              />
            </div>
          )}

          {/* Active Problem */}
          {currentProblem && !currentProblem.completed && (
            <div className="space-y-4">
              {/* Problem Statement */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{currentProblem.problem}</p>
                
                {/* Core Concepts Identified */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Core Concepts Identified
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentProblem.coreConceptsIdentified.map((concept, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Socratic Questions */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Guiding Questions
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-800 font-medium">🤔 What type of data structure are you working with?</p>
                    <p className="text-sm text-gray-600 mt-1">Think about the properties of the input...</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-800 font-medium">🎯 What is the key property that makes this problem solvable efficiently?</p>
                    <p className="text-sm text-gray-600 mt-1">Hint: Look at the word "sorted"...</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-800 font-medium">⚡ How can you eliminate unnecessary comparisons?</p>
                    <p className="text-sm text-gray-600 mt-1">Consider dividing the problem space...</p>
                  </div>
                </div>
              </div>

              {/* Tiered Hints */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help? Request a Hint</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['bronze', 'silver', 'gold'] as const).map((level) => {
                    const hint = getHintContent(level);
                    const used = currentProblem.hintsUsed[level];
                    return (
                      <div key={level} className="border border-gray-300 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{hint.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">Cost: -{hint.xpCost} XP</p>
                        <button
                          onClick={() => handleRequestHint(level)}
                          disabled={used > 0}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            used > 0
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {used > 0 ? 'Already Used' : 'Request Hint'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Show Hint Content */}
                {currentHintLevel && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      {getHintContent(currentHintLevel).title}
                    </h4>
                    <p className="text-yellow-800">{getHintContent(currentHintLevel).content}</p>
                  </div>
                )}
              </div>

              {/* Answer Submission */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Solution Approach</h3>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Explain your approach or write your solution here..."
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                />
                <button
                  onClick={handleSubmitAnswer}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}

          {/* Problem Completed */}
          {currentProblem && currentProblem.completed && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-green-900">Great Job!</h3>
                    <p className="text-green-700">You've successfully solved this problem</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">XP Earned</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{50 - (currentProblem.hintsUsed.bronze * 5 + currentProblem.hintsUsed.silver * 10 + currentProblem.hintsUsed.gold * 15)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Hints Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentProblem.hintsUsed.bronze + currentProblem.hintsUsed.silver + currentProblem.hintsUsed.gold}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSimilarProblem(true)}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Generate Similar Problem for Practice
                </button>
              </div>

              {/* Similar Problem Generator */}
              {showSimilarProblem && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 text-purple-600 mr-2" />
                    Similar Problem - Test Your Mastery
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed">
                      <strong>New Challenge:</strong> Implement a binary search algorithm to find the first occurrence of a target value in a sorted array that may contain duplicates. Return -1 if the target is not found.
                    </p>
                    <p className="text-sm text-purple-700 mt-2">
                      💡 This uses the same core logic but requires a slight modification to handle duplicates.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleStartProblem("Implement binary search to find the first occurrence of a target in a sorted array with duplicates");
                      setShowSimilarProblem(false);
                    }}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  >
                    Start This Problem
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Study Summary */}
          {studySession.problemsSolved > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                Study Session Summary
              </h3>
              
              <div className="space-y-4">
                {/* Mastered Concepts */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    What You Mastered Today
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(studySession.masteredConcepts)).map((concept, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✓ {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Needed */}
                {studySession.reviewNeeded.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Review Needed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(studySession.reviewNeeded)).map((concept, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          ⚠️ {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Resources */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📚 Recommended Resources</h4>
                  <ul className="space-y-2">
                    <li className="text-blue-800">
                      <a href="#" className="hover:underline">→ Python Documentation: Binary Search</a>
                    </li>
                    <li className="text-blue-800">
                      <a href="#" className="hover:underline">→ Textbook: Chapter 3 - Divide and Conquer Algorithms</a>
                    </li>
                    <li className="text-blue-800">
                      <a href="#" className="hover:underline">→ Practice Problems: LeetCode Binary Search Collection</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
