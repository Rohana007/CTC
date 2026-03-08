import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, RotateCcw, Award, Target } from 'lucide-react';
import { KnowledgeCheckQuestion } from '../../../shared/types';

interface KnowledgeCheckQuizProps {
  questions: KnowledgeCheckQuestion[];
  algorithmType: string;
}

export const KnowledgeCheckQuiz: React.FC<KnowledgeCheckQuizProps> = ({ 
  questions, 
  algorithmType 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowResults(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowResults(false);
    }
  };

  const handleShowAnswer = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizCompleted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const getDifficultyColor = (difficulty: KnowledgeCheckQuestion['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '👍';
    return '📚';
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No knowledge check questions available for this algorithm.</p>
        </div>
      </div>
    );
  }

  const score = calculateScore();
  const currentQ = questions[currentQuestion];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Knowledge Check Quiz</h3>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {algorithmType} • Question {currentQuestion + 1} of {questions.length}
            </span>
            {!quizCompleted && (
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {!quizCompleted ? (
          <>
            {/* Current Question */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQ.difficulty)}`}>
                  {currentQ.difficulty.toUpperCase()}
                </span>
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                {currentQ.question}
              </h4>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestion] === index;
                  const isCorrect = index === currentQ.correctAnswer;
                  const showCorrectness = showResults;
                  
                  let buttonClass = 'w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ';
                  
                  if (showCorrectness) {
                    if (isCorrect) {
                      buttonClass += 'border-green-500 bg-green-50 text-green-800';
                    } else if (isSelected && !isCorrect) {
                      buttonClass += 'border-red-500 bg-red-50 text-red-800';
                    } else {
                      buttonClass += 'border-gray-200 bg-gray-50 text-gray-600';
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += 'border-indigo-500 bg-indigo-50 text-indigo-800';
                    } else {
                      buttonClass += 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={buttonClass}
                      disabled={showResults}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{option}</span>
                        <div className="flex items-center ml-4">
                          {showCorrectness && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {showCorrectness && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          {!showCorrectness && isSelected && (
                            <div className="w-4 h-4 bg-indigo-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation (shown after revealing answer) */}
            {showResults && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">💡 Explanation</h5>
                <p className="text-blue-800 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <div className="flex space-x-3">
                {!showResults && selectedAnswers[currentQuestion] !== undefined && (
                  <button
                    onClick={handleShowAnswer}
                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    Show Answer
                  </button>
                )}
                
                {showResults && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Quiz Results */
          <div className="text-center">
            <div className="mb-6">
              <Award className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h4>
              <p className="text-gray-600">Here's how you performed on the {algorithmType} quiz</p>
            </div>

            {/* Score Display */}
            <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="text-4xl font-bold mb-2">
                <span className={getScoreColor(score.percentage)}>
                  {getScoreIcon(score.percentage)} {score.percentage}%
                </span>
              </div>
              <p className="text-gray-700">
                {score.correct} out of {score.total} questions correct
              </p>
            </div>

            {/* Performance Feedback */}
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Performance Analysis</h5>
              <div className="text-sm text-gray-600 space-y-1">
                {score.percentage >= 80 && (
                  <p>🎉 Excellent! You have a strong understanding of {algorithmType}.</p>
                )}
                {score.percentage >= 60 && score.percentage < 80 && (
                  <p>👍 Good work! Review the explanations to strengthen your understanding.</p>
                )}
                {score.percentage < 60 && (
                  <p>📚 Keep studying! Consider reviewing the concept explanations and trying again.</p>
                )}
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">Question Breakdown</h5>
              <div className="space-y-2">
                {questions.map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Question {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="flex items-center px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors mx-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Quiz Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};