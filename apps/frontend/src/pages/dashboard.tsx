import React, { useState } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { TaskQuery } from '@/types/task.types';
import { TaskStatsCards } from '@/features/task/components/TaskStatsCards';
import { TaskFilterBar } from '@/features/task/components/TaskFilterBar';
import { TaskList } from '@/features/task/components/TaskList';
import { PaginationBar } from '@/features/task/components/PaginationBar';
import { TaskFormModal } from '@/features/task/components/TaskFormModal';
import { DeleteTaskModal } from '@/features/task/components/DeleteTaskModal';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/stores/store';
import { openCreateTaskModal } from '@/stores/uiSlice';
import { Plus } from 'lucide-react';
import { TaskFormValues } from '@/features/task/schemas/task.schema';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<TaskQuery>({
    page: 1,
    limit: 9,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    tasks,
    pagination,
    summary,
    isLoading,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useTasks(filters);

  const handleFilterChange = (updated: Partial<TaskQuery>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateSubmit = async (values: TaskFormValues) => {
    await createTask({
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    });
  };

  const handleUpdateSubmit = async (id: string, values: TaskFormValues) => {
    await updateTask(id, {
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    });
  };

  return (
    <AuthGuard>
      <AppLayout title="Dashboard">
        <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Task Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Kelola, prioritaskan, dan Pantau semua tugas Anda di satu tempat.
              </p>
            </div>

            <Button
              onClick={() => dispatch(openCreateTaskModal())}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Task
            </Button>
          </div>

          {/* Stats */}
          <TaskStatsCards summary={summary} isLoading={isLoading} />

          {/* Filter Bar */}
          <TaskFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Task Grid */}
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onStatusChange={updateTaskStatus}
          />

          {/* Pagination */}
          <PaginationBar
            pagination={pagination}
            onPageChange={handlePageChange}
          />

          {/* Modals */}
          <TaskFormModal
            tasks={tasks}
            onCreate={handleCreateSubmit}
            onUpdate={handleUpdateSubmit}
          />

          <DeleteTaskModal tasks={tasks} onDelete={deleteTask} />
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
