export interface Household {
  id: string;
  name: string;
}

export interface Kid {
  id: string;
  householdId: string;
  name: string;
  avatar: string;
  color: string;
  order: number;
}

export interface Task {
  id: string;
  householdId: string;
  title: string;
  points: number;
  icon: string;
  category: 'household' | 'personal';
  assignedKidId?: string;
  isActive: boolean;
  createdAt: number;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  kidId: string;
  pointsAwarded: number;
  completedAt: number;
  note?: string;
}

export interface Reward {
  id: string;
  householdId: string;
  title: string;
  pointsCost: number;
  icon: string;
  category: string;
  isActive: boolean;
  createdAt: number;
}

export interface Redemption {
  id: string;
  rewardId: string;
  kidId: string;
  pointsSpent: number;
  redeemedAt: number;
}
