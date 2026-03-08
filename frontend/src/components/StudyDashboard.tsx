import React from 'react';
import { Brain, Trophy, Target, Zap, BookOpen, Clock, TrendingUp, Award } from 'lucide-react';
import { StatCardWithRing, MiniProgressRing } from './ProgressRing';

interface StudyDashboardProps {
  stats: {
    conceptsMastered: number;
    totalConcepts: number;
    problemsSolved: number;
    totalProblems: number;
    studyStreak: number;
    xpEarned: number;
    hintsUsed: number;
    accuracy: number;
  };
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="glass-card p-6 border-2 border-transparent bg-gradient-to-r from-blue-600/10 to-violet-600/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-high-contrast mb-2">Study Mode Dashboard</h2>
            <p className="text-medium-contrast">Track your learning progress and achievements</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{stats.xpEarned}</span>
              </div>
              <span className="text-xs text-gray-400">Total XP</span>
            </div>
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Trophy className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">{stats.studyStreak}</span>
              </div>
              <span className="text-xs text-gray-400">Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="bento-grid-enhanced">
        {/* Concepts Mastered - Large Card */}
        <div className="col-span-1 row-span-2">
          <StatCardWithRing
            title="Concepts Mastered"
            value={stats.conceptsMastered}
            total={stats.totalConcepts}
            icon={<Brain className="w-6 h-6" />}
            color="#00d4ff"
            subtitle="Keep learning to master more!"
          />
        </div>

        {/* Problems Solved */}
        <div className="col-span-1">
          <StatCardWithRing
            title="Problems Solved"
            value={stats.problemsSolved}
            total={stats.totalProblems}
            icon={<Target className="w-6 h-6" />}
            color="#7c3aed"
            subtitle="Great progress!"
          />
        </div>

        {/* Accuracy Card */}
        <div className="bento-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Accuracy Rate</h3>
              <p className="text-3xl font-bold text-white">{stats.accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">Based on quiz results</p>
            </div>
            <div className="relative">
              <MiniProgressRing progress={stats.accuracy} size={60} color="#10b981" />
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="bento-card bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500/20 rounded-xl neon-icon text-orange-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Study Streak</h3>
              <p className="text-3xl font-bold text-white">{stats.studyStreak} Days</p>
              <p className="text-xs text-orange-400 mt-1">🔥 Keep it going!</p>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="bento-card bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border-yellow-500/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl neon-icon text-yellow-400">
              <Zap className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Experience Points</h3>
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.xpEarned % 1000) / 10}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{stats.xpEarned}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{1000 - (stats.xpEarned % 1000)} XP to next level</p>
            </div>
          </div>
        </div>

        {/* Hints Used */}
        <div className="bento-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Hints Used</h3>
              <p className="text-3xl font-bold text-white">{stats.hintsUsed}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="badge-saas text-xs">Bronze: {Math.floor(stats.hintsUsed * 0.5)}</span>
                <span className="badge-saas text-xs">Silver: {Math.floor(stats.hintsUsed * 0.3)}</span>
                <span className="badge-saas text-xs">Gold: {Math.floor(stats.hintsUsed * 0.2)}</span>
              </div>
            </div>
            <BookOpen className="w-12 h-12 text-blue-400 neon-icon" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-full bento-card">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <ActivityItem
              icon={<Brain className="w-4 h-4" />}
              title="Mastered: Binary Search Algorithm"
              time="2 hours ago"
              color="text-blue-400"
            />
            <ActivityItem
              icon={<Target className="w-4 h-4" />}
              title="Solved: Array Manipulation Problem"
              time="5 hours ago"
              color="text-violet-400"
            />
            <ActivityItem
              icon={<Award className="w-4 h-4" />}
              title="Achievement Unlocked: 7 Day Streak"
              time="1 day ago"
              color="text-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="divider-glow" />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          label="Avg. Study Time"
          value="2.5h"
          icon={<Clock className="w-5 h-5" />}
          color="text-blue-400"
        />
        <QuickStat
          label="Best Streak"
          value={`${stats.studyStreak} days`}
          icon={<Trophy className="w-5 h-5" />}
          color="text-orange-400"
        />
        <QuickStat
          label="Total Sessions"
          value="42"
          icon={<BookOpen className="w-5 h-5" />}
          color="text-violet-400"
        />
        <QuickStat
          label="Rank"
          value="#127"
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-green-400"
        />
      </div>
    </div>
  );
};

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  time: string;
  color: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, time, color }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
    <div className={`p-2 rounded-lg bg-gray-800 ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);

interface QuickStatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ label, value, icon, color }) => (
  <div className="glass-card p-4 text-center">
    <div className={`inline-flex p-2 rounded-lg bg-gray-800 ${color} mb-2`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);
