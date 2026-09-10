import React from 'react';
import { Task, TaskStatus } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { Skeleton } from '@/components/common/Skeleton';
import { Inbox, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/stores/store';
import { openCreateTaskModal } from '@/stores/uiSlice';
import { motion } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onStatusChange,
}) => {
  const dispatch = useAppDispatch();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-xl bg-white border border-slate-200 p-5 space-y-4"
          >
            <div className="flex justify-between">
              <Skeleton className="w-20 h-5" />
              <Skeleton className="w-14 h-5" />
            </div>
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-full h-12" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
        <div className="p-4 rounded-2xl bg-slate-100 text-slate-400 mb-4">
          <Inbox className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No tasks found</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
          There are no tasks matching your filters. Create a new task to get started.
        </p>
        <Button
          onClick={() => dispatch(openCreateTaskModal())}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create First Task
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
        >
          <TaskCard task={task} onStatusChange={onStatusChange} />
        </motion.div>
      ))}
    </div>
  );
};
