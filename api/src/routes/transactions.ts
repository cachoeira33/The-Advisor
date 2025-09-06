import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = express.Router();
const upload = multer({ dest: '/tmp/' });

const transactionSchema = z.object({
  business_id: z.string().uuid(),
  description: z.string().min(1),
  amount: z.number(),
  currency: z.string().length(3).default('USD'),
  category_id: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().datetime(),
  reference: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
});

// Get transactions for a business
router.get('/:businessId', 
  authenticateToken,
  requireRole(['OWNER', 'ADMIN', 'ANALYST', 'VIEWER']),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const businessId = req.params.businessId;
    const { page = 1, limit = 50, category, type, search } = req.query;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, color)
      `)
      .eq('business_id', businessId)
      .order('date', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category_id', category as string);
    }
    
    if (type) {
      query = query.eq('type', type as string);
    }
    
    if (search) {
      query = query.ilike('description', `%${search}%`);
    }

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: transactions, error } = await query;

    if (error) {
      throw createError('Failed to fetch transactions', 500);
    }

    res.json(transactions);
  })
);

// Create transaction
router.post('/', 
  authenticateToken,
  requireRole(['OWNER', 'ADMIN', 'ANALYST']),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const transactionData = transactionSchema.parse(req.body);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      throw createError('Failed to create transaction', 500);
    }

    res.status(201).json(transaction);
  })
);

// Update transaction
router.put('/:id', 
  authenticateToken,
  requireRole(['OWNER', 'ADMIN', 'ANALYST']),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const transactionId = req.params.id;
    const updates = transactionSchema.partial().parse(req.body);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw createError('Failed to update transaction', 500);
    }

    if (!transaction) {
      throw createError('Transaction not found', 404);
    }

    res.json(transaction);
  })
);

// Delete transaction
router.delete('/:id', 
  authenticateToken,
  requireRole(['OWNER', 'ADMIN']),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const transactionId = req.params.id;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      throw createError('Failed to delete transaction', 500);
    }

    res.json({ message: 'Transaction deleted successfully' });
  })
);

// Import transactions from CSV
router.post('/:businessId/import', 
  authenticateToken,
  requireRole(['OWNER', 'ADMIN', 'ANALYST']),
  upload.single('file'),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const businessId = req.params.businessId;
    
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const transactions: any[] = [];
    const fs = await import('fs');
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(req.file!.path)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Parse CSV row to transaction format
            const transaction = {
              business_id: businessId,
              description: row.description || row.Description,
              amount: parseFloat(row.amount || row.Amount),
              type: parseFloat(row.amount || row.Amount) > 0 ? 'INCOME' : 'EXPENSE',
              date: new Date(row.date || row.Date).toISOString(),
              reference: row.reference || row.Reference,
              currency: 'USD',
              tags: [],
              metadata: {},
            };
            
            transactions.push(transaction);
          } catch (error) {
            console.error('Error parsing row:', row, error);
          }
        })
        .on('end', async () => {
          try {
            // Batch insert transactions
            const { data, error } = await supabase
              .from('transactions')
              .insert(transactions);

            if (error) {
              throw createError('Failed to import transactions', 500);
            }

            // Clean up temp file
            fs.unlinkSync(req.file!.path);

            res.json({
              message: 'Transactions imported successfully',
              count: transactions.length,
            });
            resolve(data);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (_error) => {
          reject(createError('Failed to process CSV file', 400));
        });
    });
  })
);

export { router as transactionRoutes };