export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'PM' | 'DESIGNER' | 'DEVELOPER' | 'BOTH';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'NEW' | 'DESIGN' | 'DESIGN_REVIEW' | 'DEVELOPMENT' | 'INTERNAL_REVIEW' | 'COMPLETED';

export interface SopTask {
  _id: string;
  task: string;
  isCompleted: boolean;
}

export interface Project {
  _id: string;
  title: string;
  client: Client | { _id: string; companyName: string; contactName: string };
  status: ProjectStatus;
  designerId: User | null;
  developerId: User | null;
  assets: {
    driveLink: string;
    figmaLink: string;
  };
  developmentData: {
    domainUrl: string;
    wpAdminUser: string;
    wpAdminPassword: string;
  };
  notes: string;
  designerSop: SopTask[];
  developerSop: SopTask[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  designerSopTemplate: string[];
  developerSopTemplate: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'PM' | 'DESIGNER' | 'DEVELOPER' | 'BOTH';
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  NEW: 'Draft',
  DESIGN: 'Design',
  DESIGN_REVIEW: 'Design Review',
  DEVELOPMENT: 'Development',
  INTERNAL_REVIEW: 'Internal Review',
  COMPLETED: 'Completed',
};

export const STATUS_ORDER: ProjectStatus[] = [
  'NEW', 'DESIGN', 'DESIGN_REVIEW', 'DEVELOPMENT', 'INTERNAL_REVIEW', 'COMPLETED'
];
