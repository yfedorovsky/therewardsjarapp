import Dexie, { type Table } from 'dexie';
import type {
  Household,
  Kid,
  Task,
  TaskCompletion,
  Reward,
  Redemption,
} from './types';

class RewardJarDB extends Dexie {
  households!: Table<Household, string>;
  kids!: Table<Kid, string>;
  tasks!: Table<Task, string>;
  taskCompletions!: Table<TaskCompletion, string>;
  rewards!: Table<Reward, string>;
  redemptions!: Table<Redemption, string>;

  constructor() {
    super('RewardJarDB');

    this.version(1).stores({
      households: 'id',
      kids: 'id, householdId, order',
      tasks: 'id, householdId, category, assignedKidId',
      taskCompletions: 'id, taskId, kidId, completedAt',
      rewards: 'id, householdId',
      redemptions: 'id, rewardId, kidId, redeemedAt',
    });
  }
}

export const db = new RewardJarDB();

// --- Household ---

export async function getHousehold(): Promise<Household | undefined> {
  return db.households.toCollection().first();
}

export async function createHousehold(household: Household): Promise<void> {
  await db.households.add(household);
}

// --- Kids ---

export async function getKids(householdId: string): Promise<Kid[]> {
  return db.kids.where('householdId').equals(householdId).sortBy('order');
}

export async function getKid(id: string): Promise<Kid | undefined> {
  return db.kids.get(id);
}

export async function createKid(kid: Kid): Promise<void> {
  await db.kids.add(kid);
}

export async function updateKid(id: string, changes: Partial<Kid>): Promise<void> {
  await db.kids.update(id, changes);
}

export async function deleteKid(id: string): Promise<void> {
  await db.kids.delete(id);
}

// --- Tasks ---

export async function getTasks(householdId: string): Promise<Task[]> {
  return db.tasks.where('householdId').equals(householdId).toArray();
}

export async function getActiveTasks(householdId: string): Promise<Task[]> {
  return db.tasks
    .where('householdId')
    .equals(householdId)
    .filter((t) => t.isActive)
    .toArray();
}

export async function getTask(id: string): Promise<Task | undefined> {
  return db.tasks.get(id);
}

export async function createTask(task: Task): Promise<void> {
  await db.tasks.add(task);
}

export async function updateTask(id: string, changes: Partial<Task>): Promise<void> {
  await db.tasks.update(id, changes);
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

// --- Task Completions ---

export async function getCompletionsForKid(kidId: string): Promise<TaskCompletion[]> {
  return db.taskCompletions.where('kidId').equals(kidId).toArray();
}

export async function getCompletionsForTask(taskId: string): Promise<TaskCompletion[]> {
  return db.taskCompletions.where('taskId').equals(taskId).toArray();
}

export async function createCompletion(completion: TaskCompletion): Promise<void> {
  await db.taskCompletions.add(completion);
}

export async function deleteCompletion(id: string): Promise<void> {
  await db.taskCompletions.delete(id);
}

// --- Rewards ---

export async function getRewards(householdId: string): Promise<Reward[]> {
  return db.rewards.where('householdId').equals(householdId).toArray();
}

export async function getActiveRewards(householdId: string): Promise<Reward[]> {
  return db.rewards
    .where('householdId')
    .equals(householdId)
    .filter((r) => r.isActive)
    .toArray();
}

export async function getReward(id: string): Promise<Reward | undefined> {
  return db.rewards.get(id);
}

export async function createReward(reward: Reward): Promise<void> {
  await db.rewards.add(reward);
}

export async function updateReward(id: string, changes: Partial<Reward>): Promise<void> {
  await db.rewards.update(id, changes);
}

export async function deleteReward(id: string): Promise<void> {
  await db.rewards.delete(id);
}

// --- Redemptions ---

export async function getRedemptionsForKid(kidId: string): Promise<Redemption[]> {
  return db.redemptions.where('kidId').equals(kidId).toArray();
}

export async function createRedemption(redemption: Redemption): Promise<void> {
  await db.redemptions.add(redemption);
}

export async function deleteRedemption(id: string): Promise<void> {
  await db.redemptions.delete(id);
}

// --- Balance (CRITICAL: always computed live) ---

export async function getKidBalance(kidId: string): Promise<number> {
  const completions = await db.taskCompletions
    .where('kidId')
    .equals(kidId)
    .toArray();
  const earned = completions.reduce((sum, c) => sum + c.pointsAwarded, 0);

  const redemptions = await db.redemptions
    .where('kidId')
    .equals(kidId)
    .toArray();
  const spent = redemptions.reduce((sum, r) => sum + r.pointsSpent, 0);

  return earned - spent;
}

// --- Manual Points ---

export async function addManualPoints(kidId: string, points: number): Promise<void> {
  const completion: TaskCompletion = {
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    taskId: 'manual',
    kidId,
    pointsAwarded: points,
    completedAt: Date.now(),
    note: `Quick add +${points}`,
  };
  await db.taskCompletions.add(completion);
}

// --- Activity Feed ---

export interface ActivityItem {
  id: string;
  type: 'completion' | 'redemption';
  kidId: string;
  icon: string;
  description: string;
  points: number;
  timestamp: number;
}

export async function getRecentActivity(limit: number, offset: number = 0): Promise<ActivityItem[]> {
  const [completions, redemptions, tasks, rewards, kids] = await Promise.all([
    db.taskCompletions.toArray(),
    db.redemptions.toArray(),
    db.tasks.toArray(),
    db.rewards.toArray(),
    db.kids.toArray(),
  ]);

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const rewardMap = new Map(rewards.map((r) => [r.id, r]));
  const kidMap = new Map(kids.map((k) => [k.id, k]));

  const items: ActivityItem[] = [];

  for (const c of completions) {
    const task = taskMap.get(c.taskId);
    const kid = kidMap.get(c.kidId);
    items.push({
      id: c.id,
      type: 'completion',
      kidId: c.kidId,
      icon: task?.icon ?? '\u2B50',
      description: `${kid?.name ?? 'Kid'} completed ${task?.title ?? c.note ?? 'Quick Add'}`,
      points: c.pointsAwarded,
      timestamp: c.completedAt,
    });
  }

  for (const r of redemptions) {
    const reward = rewardMap.get(r.rewardId);
    const kid = kidMap.get(r.kidId);
    items.push({
      id: r.id,
      type: 'redemption',
      kidId: r.kidId,
      icon: reward?.icon ?? '\u{1F381}',
      description: `${kid?.name ?? 'Kid'} redeemed ${reward?.title ?? 'Reward'}`,
      points: -r.pointsSpent,
      timestamp: r.redeemedAt,
    });
  }

  items.sort((a, b) => b.timestamp - a.timestamp);
  return items.slice(offset, offset + limit);
}

export async function getTotalActivityCount(): Promise<number> {
  const [cCount, rCount] = await Promise.all([
    db.taskCompletions.count(),
    db.redemptions.count(),
  ]);
  return cCount + rCount;
}

// --- Data Export/Import/Reset ---

export async function exportAllData(): Promise<string> {
  const [households, kids, tasks, completions, rewards, redemptions] = await Promise.all([
    db.households.toArray(),
    db.kids.toArray(),
    db.tasks.toArray(),
    db.taskCompletions.toArray(),
    db.rewards.toArray(),
    db.redemptions.toArray(),
  ]);
  return JSON.stringify({ households, kids, tasks, completions, rewards, redemptions }, null, 2);
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction('rw', [db.households, db.kids, db.tasks, db.taskCompletions, db.rewards, db.redemptions], async () => {
    await db.households.clear();
    await db.kids.clear();
    await db.tasks.clear();
    await db.taskCompletions.clear();
    await db.rewards.clear();
    await db.redemptions.clear();

    if (data.households) await db.households.bulkAdd(data.households);
    if (data.kids) await db.kids.bulkAdd(data.kids);
    if (data.tasks) await db.tasks.bulkAdd(data.tasks);
    if (data.completions) await db.taskCompletions.bulkAdd(data.completions);
    if (data.rewards) await db.rewards.bulkAdd(data.rewards);
    if (data.redemptions) await db.redemptions.bulkAdd(data.redemptions);
  });
}

export async function resetAllData(): Promise<void> {
  await db.transaction('rw', [db.households, db.kids, db.tasks, db.taskCompletions, db.rewards, db.redemptions], async () => {
    await db.households.clear();
    await db.kids.clear();
    await db.tasks.clear();
    await db.taskCompletions.clear();
    await db.rewards.clear();
    await db.redemptions.clear();
  });
}

// --- Seed check ---

export async function isDatabaseSeeded(): Promise<boolean> {
  const count = await db.households.count();
  return count > 0;
}
