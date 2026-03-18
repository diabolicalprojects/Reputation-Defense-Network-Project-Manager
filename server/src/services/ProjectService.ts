import Project, { ProjectStatus, ISopTask } from '../models/Project';
import Settings from '../models/Settings';

export class ProjectService {
  static async getTemplatesForPM(pmId: string) {
    const settings = await Settings.findOne({ pmId });
    return {
      designerSop: settings?.designerSopTemplate || [],
      developerSop: settings?.developerSopTemplate || [],
    };
  }

  static createSopFromTemplate(template: string[]): ISopTask[] {
    return template.map(task => ({ task, isCompleted: false }));
  }

  static validateTransition(project: any, newStatus: ProjectStatus): string | null {
    const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
      NEW: ['DESIGN'],
      DESIGN: ['DESIGN_REVIEW'],
      DESIGN_REVIEW: ['DESIGN', 'DEVELOPMENT'],
      DEVELOPMENT: ['INTERNAL_REVIEW'],
      INTERNAL_REVIEW: ['COMPLETED', 'DEVELOPMENT'],
      COMPLETED: [],
    };

    const currentStatus = project.status as ProjectStatus;

    if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      return `Cannot transition from ${currentStatus} to ${newStatus}`;
    }

    switch (newStatus) {
      case 'DESIGN':
        if (!project.designerId) return 'A Designer must be assigned before moving to Design';
        break;
      case 'DESIGN_REVIEW':
        if (!project.assets?.figmaLink) return 'A Figma link must be submitted before Design Review';
        break;
      case 'DEVELOPMENT':
        if (!project.developmentData?.wpAdminUser || !project.developmentData?.wpAdminPassword || !project.developmentData?.domainUrl) {
          return 'WordPress credentials (wpAdminUser, wpAdminPassword, domainUrl) are required';
        }
        if (!project.developerId) return 'A Developer must be assigned before moving to Development';
        break;
      case 'INTERNAL_REVIEW':
        const designerIncomplete = project.designerSop?.some((t: any) => !t.isCompleted);
        const developerIncomplete = project.developerSop?.some((t: any) => !t.isCompleted);
        if (designerIncomplete || developerIncomplete) {
          return 'All Designer and Developer SOP tasks must be completed before Internal Review';
        }
        break;
    }

    return null;
  }
}
