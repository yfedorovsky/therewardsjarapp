import {
  isDatabaseSeeded,
  createHousehold,
  createKid,
  createTask,
  createReward,
  getKids,
  getTasks,
  getRewards,
} from './db';
import type { Household, Kid, Task, Reward } from './types';

const HOUSEHOLD_ID = 'household-1';

const seedHousehold: Household = {
  id: HOUSEHOLD_ID,
  name: 'Home',
};

const seedKids: Kid[] = [
  {
    id: 'kid-1',
    householdId: HOUSEHOLD_ID,
    name: 'Daniel',
    avatar: '\u{1F466}',
    color: '#4F8EF7',
    order: 0,
  },
  {
    id: 'kid-2',
    householdId: HOUSEHOLD_ID,
    name: 'Emma',
    avatar: '\u{1F467}',
    color: '#F76FAB',
    order: 1,
  },
];

const now = Date.now();

const seedTasks: Task[] = [
  {
    id: 'task-1',
    householdId: HOUSEHOLD_ID,
    title: 'Bedtime on time',
    points: 2,
    icon: '\u{1F319}',
    category: 'household',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'task-2',
    householdId: HOUSEHOLD_ID,
    title: 'Pick up toys',
    points: 2,
    icon: '\u{1F9F8}',
    category: 'household',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'task-3',
    householdId: HOUSEHOLD_ID,
    title: 'Brush teeth',
    points: 1,
    icon: '\u{1FAA5}',
    category: 'household',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'task-4',
    householdId: HOUSEHOLD_ID,
    title: 'Help set table',
    points: 2,
    icon: '\u{1F37D}\u{FE0F}',
    category: 'household',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'task-5',
    householdId: HOUSEHOLD_ID,
    title: 'Read a book',
    points: 3,
    icon: '\u{1F4DA}',
    category: 'household',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'task-6',
    householdId: HOUSEHOLD_ID,
    title: 'Practice piano',
    points: 3,
    icon: '\u{1F3B9}',
    category: 'personal',
    assignedKidId: 'kid-1',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'task-7',
    householdId: HOUSEHOLD_ID,
    title: 'Clean room',
    points: 5,
    icon: '\u{1F9F9}',
    category: 'personal',
    isActive: true,
    createdAt: now,
  },
];

const seedRewards: Reward[] = [
  {
    id: 'reward-1',
    householdId: HOUSEHOLD_ID,
    title: '30 min iPad',
    pointsCost: 30,
    icon: '\u{1F4F1}',
    category: 'screen-time',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'reward-2',
    householdId: HOUSEHOLD_ID,
    title: 'Choose dessert',
    pointsCost: 25,
    icon: '\u{1F370}',
    category: 'treats',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'reward-3',
    householdId: HOUSEHOLD_ID,
    title: 'Small toy',
    pointsCost: 75,
    icon: '\u{1F381}',
    category: 'toys',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'reward-4',
    householdId: HOUSEHOLD_ID,
    title: 'Family outing choice',
    pointsCost: 150,
    icon: '\u{1F3A1}',
    category: 'experiences',
    isActive: true,
    createdAt: now,
  },
  {
    id: 'reward-5',
    householdId: HOUSEHOLD_ID,
    title: 'Extra bedtime story',
    pointsCost: 10,
    icon: '\u{1F4D6}',
    category: 'treats',
    isActive: true,
    createdAt: now,
  },
];

export async function seedDatabase(): Promise<void> {
  const seeded = await isDatabaseSeeded();
  if (seeded) {
    console.log('[Reward Jar] Database already seeded, loading existing data...');
    const kids = await getKids(HOUSEHOLD_ID);
    const tasks = await getTasks(HOUSEHOLD_ID);
    const rewards = await getRewards(HOUSEHOLD_ID);
    console.log('[Reward Jar] Kids:', kids);
    console.log('[Reward Jar] Tasks:', tasks);
    console.log('[Reward Jar] Rewards:', rewards);
    return;
  }

  console.log('[Reward Jar] Seeding database...');

  await createHousehold(seedHousehold);

  for (const kid of seedKids) {
    await createKid(kid);
  }

  for (const task of seedTasks) {
    await createTask(task);
  }

  for (const reward of seedRewards) {
    await createReward(reward);
  }

  // Log the seeded data for verification
  const kids = await getKids(HOUSEHOLD_ID);
  const tasks = await getTasks(HOUSEHOLD_ID);
  const rewards = await getRewards(HOUSEHOLD_ID);
  console.log('[Reward Jar] Seed complete!');
  console.log('[Reward Jar] Household:', seedHousehold);
  console.log('[Reward Jar] Kids:', kids);
  console.log('[Reward Jar] Tasks:', tasks);
  console.log('[Reward Jar] Rewards:', rewards);
}
