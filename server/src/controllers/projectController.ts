import { Response } from 'express';
import Project, { ProjectStatus } from '../models/Project';
import Settings from '../models/Settings';
import { ProjectService } from '../services/ProjectService';
import { AuthRequest } from '../middlewares/authMiddleware';

// Transition validation rules (Legacy - use ProjectService now)
const validateTransition = ProjectService.validateTransition;

export const getAllProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    
    let query = {};
    if (role === 'PM') {
      query = { pmId: userId };
    } else {
      query = { $or: [{ designerId: userId }, { developerId: userId }] };
    }

    const projects = await Project.find(query)
      .populate('client', 'companyName contactName')
      .populate('designerId', 'name email role')
      .populate('developerId', 'name email role')
      .select('-__v')
      .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'companyName contactName')
      .populate('designerId', 'name email role')
      .populate('developerId', 'name email role')
      .select('-__v');
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Role-based security
    const { role, userId } = req.user!;
    if (role === 'PM') {
      if (project.pmId.toString() !== userId) {
        res.status(403).json({ message: 'Not authorized for this project' });
        return;
      }
    } else {
      const isDesigner = project.designerId?.toString() === userId;
      const isDeveloper = project.developerId?.toString() === userId;
      if (!isDesigner && !isDeveloper) {
         res.status(403).json({ message: 'Not authorized for this project' });
         return;
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pmId = req.user?.userId as string;
    const templates = await ProjectService.getTemplatesForPM(pmId);
    
    // Use SOPs from request if they have items, otherwise fallback to templates
    const designerSop = (req.body.designerSop && req.body.designerSop.length > 0) 
      ? req.body.designerSop 
      : ProjectService.createSopFromTemplate(templates.designerSop);
      
    const developerSop = (req.body.developerSop && req.body.developerSop.length > 0) 
      ? req.body.developerSop 
      : ProjectService.createSopFromTemplate(templates.developerSop);

    const project = await Project.create({
      ...req.body,
      pmId,
      designerSop,
      developerSop,
    });

    const populated = await project.populate([
      { path: 'client', select: 'companyName contactName' },
      { path: 'designerId', select: 'name email' },
      { path: 'developerId', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Role-based restrictions
    if (role !== 'PM') {
      const isDesigner = project.designerId?.toString() === userId;
      const isDeveloper = project.developerId?.toString() === userId;

      if (!isDesigner && !isDeveloper) {
        res.status(403).json({ message: 'You are not assigned to this project' });
        return;
      }

      const updateData: any = {};
      if (isDesigner) {
        if (req.body.assets?.figmaLink !== undefined) updateData['assets.figmaLink'] = req.body.assets.figmaLink;
      }
      
      if (isDeveloper) {
        const { assets, developmentData } = req.body;
        if (assets?.figmaLink !== undefined) updateData['assets.figmaLink'] = assets.figmaLink;
        if (developmentData?.domainUrl !== undefined) updateData['developmentData.domainUrl'] = developmentData.domainUrl;
        if (developmentData?.wpAdminUser !== undefined) updateData['developmentData.wpAdminUser'] = developmentData.wpAdminUser;
        if (developmentData?.wpAdminPassword !== undefined) updateData['developmentData.wpAdminPassword'] = developmentData.wpAdminPassword;
      }
      
      await Project.findByIdAndUpdate(id, { $set: updateData });
    } else {
      // PM ownership check
      if (project.pmId.toString() !== userId) {
        res.status(403).json({ message: 'Not authorized to update this project' });
        return;
      }

      // Sanitization: PM can't change pmId or critical metadata directly through body
      const allowedFields = ['title', 'client', 'status', 'designerId', 'developerId', 'assets', 'developmentData', 'notes', 'designerSop', 'developerSop'];
      const sanitizedBody = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      await Project.findByIdAndUpdate(id, { $set: sanitizedBody });
    }

    const updated = await Project.findById(id)
      .populate('client', 'companyName contactName')
      .populate('designerId', 'name email')
      .populate('developerId', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProjectStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;
    const { role, userId } = req.user!;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Role-based ownership check
    if (role === 'PM') {
      if (project.pmId.toString() !== userId) {
        res.status(403).json({ message: 'Not authorized for this project' });
        return;
      }
    } else {
      const isDesigner = project.designerId?.toString() === userId;
      const isDeveloper = project.developerId?.toString() === userId;
      if (!isDesigner && !isDeveloper) {
        res.status(403).json({ message: 'You are not assigned to this project' });
        return;
      }
    }

    const error = validateTransition(project, status as ProjectStatus);
    if (error) {
      res.status(400).json({ message: error });
      return;
    }

    if (status === 'COMPLETED' && project.status !== 'COMPLETED') {
      project.completedAt = new Date();
    }
    if (notes) {
      const timestamp = new Date().toLocaleString();
      project.notes = `[${timestamp}]: ${notes}\n${project.notes}`;
    }

    project.status = status;
    await project.save();

    const populated = await project.populate([
      { path: 'client', select: 'companyName contactName' },
      { path: 'designerId', select: 'name email' },
      { path: 'developerId', select: 'name email' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const project = await Project.findOneAndDelete({ _id: req.params.id, pmId: userId });
    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    let query: any = {};
    if (role === 'DESIGNER') {
      query = { designerId: userId, status: { $in: ['DESIGN', 'DESIGN_REVIEW'] } };
    } else if (role === 'DEVELOPER') {
      query = { developerId: userId, status: { $in: ['DEVELOPMENT', 'INTERNAL_REVIEW'] } };
    } else if (role === 'BOTH') {
      query = {
        $or: [
          { designerId: userId, status: { $in: ['DESIGN', 'DESIGN_REVIEW'] } },
          { developerId: userId, status: { $in: ['DEVELOPMENT', 'INTERNAL_REVIEW'] } },
        ],
      };
    }

    const projects = await Project.find(query)
      .populate('client', 'companyName contactName')
      .populate('designerId', 'name email')
      .populate('developerId', 'name email')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateSopTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const { isCompleted } = req.body;
    const { userId, role } = req.user!;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Role-based security check
    const isOwner = project.pmId.toString() === userId;
    const isDesigner = project.designerId?.toString() === userId;
    const isDeveloper = project.developerId?.toString() === userId;

    if (!isOwner && !isDesigner && !isDeveloper) {
      res.status(403).json({ message: 'Not authorized for this project' });
      return;
    }

    let task = (project.designerSop as any).id(taskId);
    if (!task) {
      task = (project.developerSop as any).id(taskId);
    }

    if (!task) {
      res.status(404).json({ message: 'SOP task not found' });
      return;
    }

    task.isCompleted = isCompleted;
    await project.save();

    const populated = await Project.findById(id)
      .populate('client', 'companyName contactName')
      .populate('designerId', 'name email')
      .populate('developerId', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
