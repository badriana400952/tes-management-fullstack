import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TaskFormValues,
  taskFormValidationSchema,
} from '../schemas/task.schema';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { closeCreateTaskModal, closeEditTaskModal } from '@/stores/uiSlice';
import { Task } from '@/types/task.types';

interface TaskFormModalProps {
  tasks: Task[];
  onCreate: (data: TaskFormValues) => Promise<unknown>;
  onUpdate: (id: string, data: TaskFormValues) => Promise<unknown>;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  tasks,
  onCreate,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { isCreateTaskModalOpen, isEditTaskModalOpen, selectedTaskId } =
    useAppSelector((state) => state.ui);

  const isEdit = isEditTaskModalOpen && !!selectedTaskId;
  const isOpen = isCreateTaskModalOpen || isEditTaskModalOpen;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingTask = isEdit
    ? tasks.find((t) => t.id === selectedTaskId)
    : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormValidationSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (isEdit && existingTask) {
      reset({
        title: existingTask.title,
        description: existingTask.description || '',
        status: existingTask.status,
        priority: existingTask.priority,
        dueDate: existingTask.dueDate
          ? new Date(existingTask.dueDate).toISOString().split('T')[0]
          : '',
      });
    } else if (!isEdit && isCreateTaskModalOpen) {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
      });
    }
  }, [isEdit, existingTask, isCreateTaskModalOpen, reset]);

  const handleClose = () => {
    if (isEdit) {
      dispatch(closeEditTaskModal());
    } else {
      dispatch(closeCreateTaskModal());
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && selectedTaskId) {
        await onUpdate(selectedTaskId, values);
      } else {
        await onCreate(values);
      }
      handleClose();
    } catch {
      // Error handled in hook toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { label: 'To-Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Urgent', value: 'URGENT' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <Input
          label="Title"
          placeholder="e.g. Design review with stakeholder"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Add relevant notes or details..."
            className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 px-3.5 py-2 text-sm transition-all focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-rose-600 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            error={errors.priority?.message}
            {...register('priority')}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
