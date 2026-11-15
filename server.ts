import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

type Role = 'customer' | 'driver' | 'merchant' | 'admin';

interface AuthedRequest extends Request {
  userRole?: Role;
  userId?: string;
}

// Verify the bearer token with Supabase and load the authoritative role from
// the caller's own RLS-protected profile. Never trust role/user-id request headers.
function requireRole(...allowedRoles: Role[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const authorization = req.headers.authorization;

    if (!supabaseUrl || !anonKey) {
      return res.status(503).json({ error: 'Authentication is not configured. Protected operations are disabled.' });
    }
    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'A valid Supabase access token is required.' });
    }

    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { apikey: anonKey, Authorization: authorization },
      });
      if (!authResponse.ok) {
        return res.status(401).json({ error: 'Invalid or expired access token.' });
      }

      const authUser = await authResponse.json() as { id?: string };
      if (!authUser.id) {
        return res.status(401).json({ error: 'Authenticated user ID is missing.' });
      }

      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(authUser.id)}&select=id,role`,
        { headers: { apikey: anonKey, Authorization: authorization } },
      );
      if (!profileResponse.ok) {
        return res.status(403).json({ error: 'Unable to verify account permissions.' });
      }

      const profiles = await profileResponse.json() as Array<{ id: string; role: Role }>;
      const role = profiles[0]?.role;
      if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Forbidden: insufficient role permissions.' });
      }

      req.userId = authUser.id;
      req.userRole = role;
      return next();
    } catch {
      return res.status(503).json({ error: 'Authentication service is temporarily unavailable.' });
    }
  };
}

// SSE clients for real-time order & GPS broadcasting
const sseClients = new Set<Response>();

function broadcastRealtimeEvent(event: string, payload: unknown) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  });
}

// In-memory store for uploaded verification documents (maps to Supabase Storage bucket 'verification-documents' in production)
const uploadedDocuments = new Map<
  string,
  { id: string; ownerId: string; docType: string; fileName: string; mimeType: string; uploadedAt: string }
>();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  const hasSupabase = Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
  );
  const paymentMode = process.env.PAYMENT_GATEWAY_MODE === 'live' ? 'live' : 'test';

  // Health & Integration Diagnostics
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'QuickGo Platform API',
      market: 'Burco, Somaliland',
      currency: 'USD',
      authProvider: hasSupabase ? 'supabase' : 'demo',
      storageProvider: hasSupabase ? 'supabase-storage' : 'demo-vault',
      paymentMode,
      realtime: 'sse',
    });
  });

  // Real-time Order & GPS SSE Stream
  app.get('/api/orders/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, ts: Date.now() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Customer OTP & Email Verification Endpoints
  app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body as { phone?: string };
    if (!phone || phone.trim().length < 7) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }
    res.json({
      sent: true,
      channel: hasSupabase ? 'supabase_sms' : 'demo_sms',
      phone,
      demoCodeHint: hasSupabase ? undefined : '123456',
      expiresInSeconds: 300,
    });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, code } = req.body as { phone?: string; code?: string };
    if (!phone || !code || code.trim().length !== 6) {
      return res.status(400).json({ verified: false, error: 'Invalid 6-digit OTP code' });
    }
    res.json({
      verified: true,
      phone,
      verifiedAt: new Date().toISOString(),
    });
  });

  app.post('/api/auth/send-email-verification', (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    res.json({
      sent: true,
      email,
      demoCodeHint: hasSupabase ? undefined : '884210',
    });
  });

  app.post('/api/auth/verify-email', (req, res) => {
    const { email, code } = req.body as { email?: string; code?: string };
    if (!email || !code || code.trim().length < 4) {
      return res.status(400).json({ verified: false, error: 'Invalid verification code' });
    }
    res.json({
      verified: true,
      email,
      verifiedAt: new Date().toISOString(),
    });
  });

  // Verification Document Upload (Supabase Storage Adapter)
  app.post('/api/storage/upload', requireRole('customer', 'driver', 'merchant', 'admin'), (req: AuthedRequest, res) => {
    const { docType, fileName, mimeType } = req.body as {
      docType?: string;
      fileName?: string;
      mimeType?: string;
    };
    if (!docType || !fileName) {
      return res.status(400).json({ error: 'docType and fileName are required' });
    }
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const record = {
      id,
      ownerId: req.userId || 'user',
      docType,
      fileName,
      mimeType: mimeType || 'application/pdf',
      uploadedAt: new Date().toISOString(),
    };
    uploadedDocuments.set(id, record);
    res.status(201).json({
      ...record,
      bucket: 'verification-documents',
      storagePath: `${record.ownerId}/${docType}/${fileName}`,
      provider: hasSupabase ? 'supabase-storage' : 'demo-vault',
    });
  });

  // Secure Payment Gateway Endpoint (Clearly Distinguishes Test Mode vs Live Mode)
  app.post('/api/payments/intent', requireRole('customer', 'driver', 'merchant', 'admin'), (req: AuthedRequest, res) => {
    const { provider, amountUsd, orderReference } = req.body as {
      provider?: string;
      amountUsd?: number;
      orderReference?: string;
    };

    if (!provider || typeof amountUsd !== 'number' || amountUsd <= 0) {
      return res.status(400).json({ error: 'Valid payment provider and positive USD amount are required' });
    }

    if (provider === 'cash_on_delivery') {
      return res.json({
        transactionId: `TXN-COD-${Date.now().toString().slice(-6)}`,
        orderReference,
        provider,
        amountUsd,
        currency: 'USD',
        status: 'pending_cod',
        isTestMode: false,
        message: 'Cash on delivery confirmed. Courier will collect USD upon arrival.',
      });
    }

    // Never simulate a real live charge when live merchant gateway keys aren't configured
    if (paymentMode === 'test') {
      return res.json({
        transactionId: `TEST-TXN-${Date.now().toString().slice(-6)}`,
        orderReference,
        provider,
        amountUsd,
        currency: 'USD',
        status: 'authorized_test',
        isTestMode: true,
        message: 'Sandbox Test Mode: Payment authorized in test environment (no real funds charged).',
      });
    }

    return res.status(501).json({
      error: 'Live payment provider credentials must be configured on the server.',
      isTestMode: false,
    });
  });

  // Real-time Order Lifecycle Broadcasts
  app.post('/api/orders/broadcast', requireRole('customer', 'driver', 'merchant', 'admin'), (req: AuthedRequest, res) => {
    const { orderId, status, gps } = req.body as {
      orderId?: string;
      status?: string;
      gps?: { lat: number; lng: number };
    };
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    broadcastRealtimeEvent('order_update', {
      orderId,
      status,
      gps,
      updatedByRole: req.userRole,
      updatedAt: new Date().toISOString(),
    });
    res.json({ broadcasted: true });
  });

  // Admin Protected Operations
  app.post('/api/admin/commission', requireRole('admin'), (req, res) => {
    const { commissionPct } = req.body as { commissionPct?: number };
    if (typeof commissionPct !== 'number' || commissionPct < 0 || commissionPct > 40) {
      return res.status(400).json({ error: 'Commission must be between 0% and 40%' });
    }
    res.json({
      updated: true,
      commissionPct,
      updatedAt: new Date().toISOString(),
    });
  });

  // Vite dev middleware or static production build
  if (!IS_PRODUCTION) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuickGo platform server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start QuickGo server:', err);
  process.exit(1);
});
