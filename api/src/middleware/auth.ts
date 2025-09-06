import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  console.log(`\n--- [${new Date().toISOString()}] Middleware authenticateToken INICIADO para ${req.method} ${req.path} ---`);
  try {
    const authHeader = req.headers.authorization;
    console.log('1. Cabeçalho Authorization recebido:', authHeader);

    const token = authHeader && authHeader.split(' ')[1];
    console.log('2. Token extraído:', token);

    if (!token) {
      console.log('!!-> BLOQUEIO: Token não encontrado. Retornando 401.');
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log('3. Verificando token com Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('!!-> BLOQUEIO: Token inválido ou expirado. Retornando 403.');
      console.error('--> Erro retornado pelo Supabase:', error);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    console.log('4. SUCESSO: Token válido. Usuário encontrado:', user.id);
    req.user = {
      id: user.id,
      email: user.email!,
    };
    
    console.log('--- Middleware authenticateToken FINALIZADO. Permitindo acesso à próxima etapa. ---\n');
    next(); // Permite que a requisição continue para o controller
  } catch (error) {
    console.error('!!-> ERRO INESPERADO no middleware authenticateToken:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

export function requireRole(roles: string[]) {
  // ... (o resto da função requireRole não precisa ser alterado)
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const businessId = req.params.businessId || req.body.business_id;
      
      if (!businessId) {
        return res.status(400).json({ error: 'Business ID required' });
      }

      // Check user role for this business
      const { data: userRole, error } = await supabase
        .from('user_business_roles')
        .select('role')
        .eq('user_id', req.user.id)
        .eq('business_id', businessId)
        .single();

      if (error || !userRole) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!roles.includes(userRole.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user.role = userRole.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}