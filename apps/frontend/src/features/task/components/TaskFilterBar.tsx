import React, { useState, useEffect } from 'react';
import { TaskPriority, TaskQuery, TaskStatus } from '@/types/task.types';
import { Search } from 'lucide-react';

interface TaskFilterBarProps {
  filters: TaskQuery;
  onFilterChange: (updated: Partial<TaskQuery>) => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilterChange({ search: searchTerm || undefined, page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const statusTabs: Array<{ label: string; value: TaskStatus | 'ALL' }> = [
    { label: 'All Tasks', value: 'ALL' },
    { label: 'To-Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
  ];

  const sortOptions = [
    { label: 'Created (Newest)', value: 'createdAt:desc' },
    { label: 'Created (Oldest)', value: 'createdAt:asc' },
    { label: 'Due Date', value: 'dueDate:asc' },
    { label: 'Title (A-Z)', value: 'title:asc' },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(':') as [
      TaskQuery['sortBy'],
      TaskQuery['sortOrder']
    ];
    onFilterChange({ sortBy, sortOrder, page: 1 });
  };

  return (
    <div className="space-y-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
          />
        </div>

        {/* Sort */}
        <div className="w-full md:w-48">
          <select
            value={`${filters.sortBy || 'createdAt'}:${filters.sortOrder || 'desc'}`}
            onChange={handleSortChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
        {statusTabs.map((tab) => {
          const isActive =
            tab.value === 'ALL'
              ? !filters.status
              : filters.status === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() =>
                onFilterChange({
                  status: tab.value === 'ALL' ? undefined : (tab.value as TaskStatus),
                  page: 1,
                })
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
