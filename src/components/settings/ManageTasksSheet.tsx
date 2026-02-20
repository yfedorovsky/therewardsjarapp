import { Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import BottomSheet from '@/components/shared/BottomSheet';
import { db, updateTask, deleteTask } from '@/lib/db';
import type { Task } from '@/lib/types';

const HOUSEHOLD_ID = 'household-1';

interface ManageTasksSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageTasksSheet({ open, onClose }: ManageTasksSheetProps) {
  const tasks = useLiveQuery(
    () => db.tasks.where('householdId').equals(HOUSEHOLD_ID).toArray(),
    [],
    [] as Task[],
  );

  const handleToggle = async (task: Task) => {
    await updateTask(task.id, { isActive: !task.isActive });
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-text">Manage Tasks</h2>
      <div className="mt-3 max-h-[50vh] overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">No tasks</p>
        ) : (
          <div className="flex flex-col gap-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  task.isActive ? '' : 'opacity-40'
                }`}
              >
                <span className="text-lg">{task.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{task.title}</p>
                  <p className="text-xs text-text-muted">+{task.points} pts</p>
                </div>
                <button
                  onClick={() => handleToggle(task)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    task.isActive
                      ? 'bg-success/15 text-success'
                      : 'bg-bg text-text-muted'
                  }`}
                >
                  {task.isActive ? 'Active' : 'Off'}
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-text-light transition-colors active:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
