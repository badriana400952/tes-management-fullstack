import React from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types/task.types';
import { Badge } from '@/components/common/Badge';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/stores/store';
import { openDeleteTaskModal, openEditTaskModal } from '@/stores/uiSlice';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const dispatch = useAppDispatch();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="status" status={task.status} />
            <Badge variant="priority" priority={task.priority} />
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => dispatch(openEditTaskModal(task.id))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="Edit Task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch(openDeleteTaskModal(task.id))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          {formattedDueDate ? (
            <>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDueDate}</span>
            </>
          ) : (
            <span className="text-slate-400 italic">No due date</span>
          )}
        </div>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
        >
          <option value="TODO">To-Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  );
};
