import { Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const query: any = {};
    if (role === 'PM' || role === 'BOTH') {
      query.managedBy = userId;
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUsersByRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    const { userId, role: requesterRole } = req.user!;
    
    let query: any = role === 'BOTH'
      ? { role: { $in: ['DESIGNER', 'DEVELOPER', 'BOTH'] } }
      : { role: { $in: [role, 'BOTH'] } };

    if (requesterRole === 'PM' || requesterRole === 'BOTH') {
      query.managedBy = userId;
    }
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;
    const updates = { ...req.body };
    
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    // Scoping check: only allow updating managed users or self
    const query: any = { _id: id };
    if (role === 'PM' || role === 'BOTH') {
      if (id !== userId) {
        query.managedBy = userId;
      }
    } else if (id !== userId) {
      res.status(403).json({ message: 'Not authorized to update this user' });
      return;
    }

    const user = await User.findOneAndUpdate(query, updates, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found or access denied' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;

    const query: any = { _id: id };
    if (role === 'PM' || role === 'BOTH') {
      query.managedBy = userId;
    } else {
      res.status(403).json({ message: 'Not authorized to delete users' });
      return;
    }

    const user = await User.findOneAndDelete(query);
    if (!user) {
      res.status(404).json({ message: 'User not found or access denied' });
      return;
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
