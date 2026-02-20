import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import FilterChips, { type FilterValue } from '@/components/tasks/FilterChips';
import TaskCard from '@/components/tasks/TaskCard';
import CompleteTaskSheet from '@/components/tasks/CompleteTaskSheet';
import AddTaskSheet from '@/components/tasks/AddTaskSheet';
import { useKids } from '@/hooks/useKids';
import { db, createTask, createCompletion } from '@/lib/db';
import type { Task } from '@/lib/types';

const HOUSEHOLD_ID = 'household-1';

export default function TasksPage() {
  const { kids, selectedKid, refreshBalance } = useKids();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const tasks = useLiveQuery(
    () => db.tasks.where('householdId').equals(HOUSEHOLD_ID).filter((t) => t.isActive).toArray(),
    [],
    [] as Task[],
  );

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'household') return task.category === 'household';
    // Kid filter: show tasks assigned to that kid + all household tasks
    return task.assignedKidId === filter || task.category === 'household';
  });

  const getSubtitle = (task: Task) => {
    if (task.assignedKidId) {
      const kid = kids.find((k) => k.id === task.assignedKidId);
      return kid ? `${kid.name} only` : 'Personal';
    }
    return 'Everyone';
  };

  // Determine which kid gets points:
  // 1. Task assigned to a specific kid → always that kid
  // 2. Filter is set to a specific kid → use that kid
  // 3. Otherwise (All / Household) → globally selected kid from Home
  const filterKid = kids.find((k) => k.id === filter) ?? null;
  const targetKid = selectedTask?.assignedKidId
    ? kids.find((k) => k.id === selectedTask.assignedKidId) ?? selectedKid
    : filterKid ?? selectedKid;

  const handleCompleteTask = async () => {
    if (!selectedTask || !targetKid) return;
    await createCompletion({
      id: `completion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      taskId: selectedTask.id,
      kidId: targetKid.id,
      pointsAwarded: selectedTask.points,
      completedAt: Date.now(),
    });
    await refreshBalance();
  };

  const handleAddTask = async (data: {
    title: string;
    points: number;
    icon: string;
    category: 'household' | 'personal';
    assignedKidId?: string;
  }) => {
    await createTask({
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      householdId: HOUSEHOLD_ID,
      title: data.title,
      points: data.points,
      icon: data.icon,
      category: data.category,
      assignedKidId: data.assignedKidId,
      isActive: true,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="flex min-h-full flex-col pb-2">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-text">Tasks</h1>
      </div>

      {/* Filters */}
      <FilterChips kids={kids} value={filter} onChange={setFilter} />

      {/* Task list */}
      <div className="flex flex-1 flex-col gap-2 px-5 pt-1">
        {filteredTasks.length === 0 ? (
          <motion.div
            className="flex flex-1 flex-col items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.span
              className="text-3xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {'\u{1F4CB}'}
            </motion.span>
            <p className="text-sm text-text-muted">No tasks found</p>
          </motion.div>
        ) : (
          filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
            >
              <TaskCard
                task={task}
                subtitle={getSubtitle(task)}
                onTap={() => {
                  setSelectedTask(task);
                  setShowComplete(true);
                }}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* FAB */}
      <motion.button
        onClick={() => setShowAdd(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white"
        style={{ boxShadow: '0 4px 14px rgba(124, 92, 252, 0.35)' }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      {/* Complete task sheet */}
      <CompleteTaskSheet
        open={showComplete}
        onClose={() => {
          setShowComplete(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        kidName={targetKid?.name ?? ''}
        onConfirm={handleCompleteTask}
      />

      {/* Add task sheet */}
      <AddTaskSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        kids={kids}
        onSave={handleAddTask}
      />
    </div>
  );
}
