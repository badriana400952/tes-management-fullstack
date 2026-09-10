import React from 'react';
import { TaskStatusCount } from '@/types/task.types';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface TaskStatsCardsProps {
  summary: TaskStatusCount;
  isLoading?: boolean;
}

export const TaskStatsCards: React.FC<TaskStatsCardsProps> = ({ summary, isLoading }) => {
  const total = summary.TODO + summary.IN_PROGRESS + summary.DONE;
  const completionPercentage = total > 0 ? Math.round((summary.DONE / total) * 100) : 0;

  const cards = [
    {
      title: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Pending To-Do',
      value: summary.TODO,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'In Progress',
      value: summary.IN_PROGRESS,
      icon: TrendingUp,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50 border-sky-100',
    },
    {
      title: 'Completed',
      value: summary.DONE,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoading ? '...' : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${card.bgColor} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center text-xs font-semibold mb-2">
          <span className="text-slate-600">Overall Completion</span>
          <span className="text-indigo-600 font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
