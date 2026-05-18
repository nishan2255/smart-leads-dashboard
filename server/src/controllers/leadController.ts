import { Response, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import Lead from '../models/Lead.js';
import { AuthRequest, ILead, LeadQueryParams } from '../types/index.js';

// ─── Get All Leads (with filters, search, sort, pagination) ──────────────────

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      source,
      search,
      sort = 'latest',
    } = req.query as LeadQueryParams;

    // Build query object dynamically — only add conditions when param exists
    const query: FilterQuery<ILead> = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      // Case-insensitive partial match on name OR email
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder: Record<string, 1 | -1> =
      sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sortOrder).skip(skip).limit(limitNum).lean(),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Leads fetched successfully',
      data: leads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Lead ─────────────────────────────────────────────────────────

export const getLeadById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).lean();

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lead fetched successfully',
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Create Lead ─────────────────────────────────────────────────────────────

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, status, source } = req.body as {
      name: string;
      email: string;
      status: string;
      source: string;
    };

    if (!name || !email || !source) {
      res.status(400).json({ success: false, message: 'Name, email, and source are required' });
      return;
    }

    const lead = await Lead.create({ name, email, status, source });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Lead ─────────────────────────────────────────────────────────────

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, status, source } = req.body as Partial<{
      name: string;
      email: string;
      status: string;
      source: string;
    }>;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, status, source },
      { new: true, runValidators: true }
    ).lean();

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Lead ─────────────────────────────────────────────────────────────

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id).lean();

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ─── Export CSV ───────────────────────────────────────────────────────────────

export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();

    const csvHeader = 'Name,Email,Status,Source,Created At\n';
    const csvRows = leads
      .map((lead) => {
        const createdAt = new Date(lead.createdAt).toISOString().split('T')[0];
        // Wrap fields in quotes to handle commas in data
        return `"${lead.name}","${lead.email}","${lead.status}","${lead.source}","${createdAt}"`;
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};
