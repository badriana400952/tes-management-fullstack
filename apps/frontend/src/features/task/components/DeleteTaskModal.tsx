import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { closeDeleteTaskModal } from '@/stores/uiSlice';
import { Task } from '@/types/task.types';
import { AlertTriangle } from 'lucide-react';

interface DeleteTaskModalProps {
  tasks: Task[];
  onDelete: (id: string) => Promise<void>;
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  tasks,
  onDelete,
}) => {
  const dispatch = useAppDispatch();
  const { isDeleteTaskModalOpen, selectedTaskId } = useAppSelector(
    (state) => state.ui
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const taskToDelete = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : undefined;

  const handleClose = () => {
    dispatch(closeDeleteTaskModal());
  };

  const handleDelete = async () => {
    if (!selectedTaskId) return;
    setIsDeleting(true);
    try {
      await onDelete(selectedTaskId);
      handleClose();
    } catch {
      // Error handled by hook toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isDeleteTaskModalOpen}
      onClose={handleClose}
      title="Delete Task"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-900">This action cannot be undone.</p>
            <p className="text-rose-700">
              Are you sure you want to permanently delete task{' '}
              <span className="font-semibold text-rose-900">
                &ldquo;{taskToDelete?.title || 'this task'}&rdquo;
              </span>
              ?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Delete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
};
