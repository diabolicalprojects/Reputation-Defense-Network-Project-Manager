import { Response } from 'express';
import Settings from '../models/Settings';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pmId = req.user?.userId;
    let settings = await Settings.findOne({ pmId });
    if (!settings) {
      settings = await Settings.create({ pmId, designerSopTemplate: [], developerSopTemplate: [] });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pmId = req.user?.userId;
    let settings = await Settings.findOne({ pmId });
    if (!settings) {
      settings = await Settings.create({ ...req.body, pmId });
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
