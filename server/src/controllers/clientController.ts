import { Response } from 'express';
import Client from '../models/Client';
import Project from '../models/Project';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clients = await Client.find({ pmId: req.user?.userId }).populate('projects').sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.findOne({ _id: req.params.id, pmId: req.user?.userId }).populate({
      path: 'projects',
      populate: [
        { path: 'designerId', select: 'name email role' },
        { path: 'developerId', select: 'name email role' },
      ],
    });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.create({ ...req.body, pmId: req.user?.userId });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, pmId: req.user?.userId }, 
      req.body, 
      { new: true }
    );
    if (!client) {
      res.status(404).json({ message: 'Client not found or access denied' });
      return;
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.findOne({ _id: req.params.id, pmId: req.user?.userId });
    if (!client) {
      res.status(404).json({ message: 'Client not found or access denied' });
      return;
    }
    // Deep delete associated projects
    await Project.deleteMany({ _id: { $in: client.projects }, pmId: req.user?.userId });
    await Client.findOneAndDelete({ _id: req.params.id, pmId: req.user?.userId });
    res.json({ message: 'Client and associated projects deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getClientProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ client: req.params.id, pmId: req.user?.userId })
      .populate('designerId', 'name email')
      .populate('developerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createClientProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pmId = req.user?.userId;
    const client = await Client.findOne({ _id: req.params.id, pmId });
    if (!client) {
      res.status(404).json({ message: 'Client not found or access denied' });
      return;
    }

    const project = await Project.create({ ...req.body, client: client._id, pmId });
    client.projects.push(project._id as any);
    await client.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
