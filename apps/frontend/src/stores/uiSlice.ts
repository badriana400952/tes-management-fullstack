import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isCreateTaskModalOpen: boolean;
  isEditTaskModalOpen: boolean;
  selectedTaskId: string | null;
  isDeleteTaskModalOpen: boolean;
}

const initialState: UiState = {
  isCreateTaskModalOpen: false,
  isEditTaskModalOpen: false,
  selectedTaskId: null,
  isDeleteTaskModalOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCreateTaskModal: (state) => {
      state.isCreateTaskModalOpen = true;
    },
    closeCreateTaskModal: (state) => {
      state.isCreateTaskModalOpen = false;
    },
    openEditTaskModal: (state, action: PayloadAction<string>) => {
      state.selectedTaskId = action.payload;
      state.isEditTaskModalOpen = true;
    },
    closeEditTaskModal: (state) => {
      state.isEditTaskModalOpen = false;
      state.selectedTaskId = null;
    },
    openDeleteTaskModal: (state, action: PayloadAction<string>) => {
      state.selectedTaskId = action.payload;
      state.isDeleteTaskModalOpen = true;
    },
    closeDeleteTaskModal: (state) => {
      state.isDeleteTaskModalOpen = false;
      state.selectedTaskId = null;
    },
  },
});

export const {
  openCreateTaskModal,
  closeCreateTaskModal,
  openEditTaskModal,
  closeEditTaskModal,
  openDeleteTaskModal,
  closeDeleteTaskModal,
} = uiSlice.actions;

export default uiSlice.reducer;
