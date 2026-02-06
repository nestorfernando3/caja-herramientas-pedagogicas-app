import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import { getDb, updateDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-caja-2026';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

function isAdmin(req) {
  const token = req.headers['x-api-key'];
  return typeof token === 'string' && token === ADMIN_API_KEY;
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'No autorizado. Se requiere clave de editor.' });
  }
  return next();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function sanitizeToolInput(input) {
  const now = new Date().toISOString();
  return {
    categoryId: String(input.categoryId || '').trim(),
    title: String(input.title || '').trim(),
    summary: String(input.summary || '').trim(),
    digitalOptions: normalizeList(input.digitalOptions),
    analogOptions: normalizeList(input.analogOptions),
    tip: String(input.tip || '').trim(),
    peiConnection: String(input.peiConnection || '').trim(),
    tags: normalizeList(input.tags),
    authorName: String(input.authorName || 'Anonimo').trim() || 'Anonimo',
    authorEmail: String(input.authorEmail || '').trim(),
    updatedAt: now
  };
}

function validateToolInput(payload) {
  const errors = [];
  if (!payload.categoryId) errors.push('categoryId es obligatorio');
  if (!payload.title || payload.title.length < 4) errors.push('title debe tener al menos 4 caracteres');
  if (!payload.summary || payload.summary.length < 12) errors.push('summary debe tener al menos 12 caracteres');
  if (!payload.tip || payload.tip.length < 8) errors.push('tip debe tener al menos 8 caracteres');
  if (!payload.peiConnection || payload.peiConnection.length < 8) {
    errors.push('peiConnection debe tener al menos 8 caracteres');
  }
  return errors;
}

function sanitizeCategoryInput(input) {
  const now = new Date().toISOString();
  return {
    name: String(input.name || '').trim(),
    description: String(input.description || '').trim(),
    color: String(input.color || '#2a9d8f').trim(),
    position: Number.isFinite(Number(input.position)) ? Number(input.position) : 999,
    isPublished: Boolean(input.isPublished),
    updatedAt: now
  };
}

function validateCategoryInput(payload) {
  const errors = [];
  if (!payload.name || payload.name.length < 3) errors.push('name debe tener al menos 3 caracteres');
  if (!payload.description || payload.description.length < 10) {
    errors.push('description debe tener al menos 10 caracteres');
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(payload.color)) errors.push('color debe ser hexadecimal (#RRGGBB)');
  return errors;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.get('/api/categories', async (req, res) => {
  const db = await getDb();
  const includeHidden = req.query.includeHidden === 'true' && isAdmin(req);

  const categories = db.categories
    .filter((category) => includeHidden || category.isPublished)
    .sort((a, b) => a.position - b.position)
    .map((category) => {
      const count = db.tools.filter((tool) => {
        if (tool.categoryId !== category.id) return false;
        return includeHidden || tool.status === 'published';
      }).length;
      return { ...category, toolCount: count };
    });

  res.json({ data: categories });
});

app.post('/api/categories', requireAdmin, async (req, res) => {
  const payload = sanitizeCategoryInput(req.body || {});
  const errors = validateCategoryInput(payload);
  if (errors.length > 0) return res.status(400).json({ errors });

  const created = {
    id: `cat-${nanoid(8)}`,
    ...payload,
    createdAt: new Date().toISOString()
  };

  await updateDb((db) => {
    db.categories.push(created);
    return db;
  });

  res.status(201).json({ data: created });
});

app.put('/api/categories/:id', requireAdmin, async (req, res) => {
  const payload = sanitizeCategoryInput(req.body || {});
  const errors = validateCategoryInput(payload);
  if (errors.length > 0) return res.status(400).json({ errors });

  let updated = null;
  await updateDb((db) => {
    const index = db.categories.findIndex((category) => category.id === req.params.id);
    if (index === -1) return db;

    updated = { ...db.categories[index], ...payload };
    db.categories[index] = updated;
    return db;
  });

  if (!updated) return res.status(404).json({ error: 'Categoria no encontrada' });
  res.json({ data: updated });
});

app.get('/api/tools', async (req, res) => {
  const db = await getDb();
  const includeHidden = req.query.includeHidden === 'true' && isAdmin(req);
  const categoryId = String(req.query.categoryId || '').trim();
  const search = String(req.query.q || '').trim().toLowerCase();
  const status = String(req.query.status || '').trim();

  let tools = db.tools.filter((tool) => includeHidden || tool.status === 'published');

  if (categoryId) tools = tools.filter((tool) => tool.categoryId === categoryId);
  if (status) tools = tools.filter((tool) => tool.status === status);
  if (search) {
    tools = tools.filter((tool) => {
      const haystack = [tool.title, tool.summary, ...(tool.tags || [])].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }

  const byCategory = new Map(db.categories.map((category) => [category.id, category]));
  tools = tools
    .map((tool) => ({ ...tool, category: byCategory.get(tool.categoryId) ?? null }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  res.json({ data: tools });
});

app.post('/api/tools', async (req, res) => {
  const db = await getDb();
  const payload = sanitizeToolInput(req.body || {});
  const errors = validateToolInput(payload);
  const categoryExists = db.categories.some((category) => category.id === payload.categoryId);

  if (!categoryExists) errors.push('categoryId no existe');
  if (errors.length > 0) return res.status(400).json({ errors });

  const now = new Date().toISOString();
  const nextStatus = isAdmin(req) ? 'published' : 'pending';

  const created = {
    id: `tool-${nanoid(10)}`,
    ...payload,
    status: nextStatus,
    createdAt: now,
    publishedAt: nextStatus === 'published' ? now : null
  };

  await updateDb((currentDb) => {
    currentDb.tools.push(created);
    return currentDb;
  });

  res.status(201).json({
    data: created,
    message: nextStatus === 'published'
      ? 'Herramienta publicada correctamente.'
      : 'Herramienta enviada a revision editorial.'
  });
});

app.put('/api/tools/:id', requireAdmin, async (req, res) => {
  const db = await getDb();
  const payload = sanitizeToolInput(req.body || {});
  const errors = validateToolInput(payload);
  const categoryExists = db.categories.some((category) => category.id === payload.categoryId);

  if (!categoryExists) errors.push('categoryId no existe');
  if (errors.length > 0) return res.status(400).json({ errors });

  let updated = null;
  await updateDb((currentDb) => {
    const index = currentDb.tools.findIndex((tool) => tool.id === req.params.id);
    if (index === -1) return currentDb;

    updated = {
      ...currentDb.tools[index],
      ...payload,
      updatedAt: new Date().toISOString()
    };

    currentDb.tools[index] = updated;
    return currentDb;
  });

  if (!updated) return res.status(404).json({ error: 'Herramienta no encontrada' });
  res.json({ data: updated });
});

app.patch('/api/tools/:id/status', requireAdmin, async (req, res) => {
  const status = String(req.body?.status || '').trim();
  const allowed = new Set(['pending', 'published', 'archived']);

  if (!allowed.has(status)) {
    return res.status(400).json({ error: 'Estado invalido. Usa pending, published o archived.' });
  }

  let updated = null;
  await updateDb((db) => {
    const index = db.tools.findIndex((tool) => tool.id === req.params.id);
    if (index === -1) return db;

    updated = {
      ...db.tools[index],
      status,
      updatedAt: new Date().toISOString(),
      publishedAt: status === 'published' ? new Date().toISOString() : db.tools[index].publishedAt
    };

    db.tools[index] = updated;
    return db;
  });

  if (!updated) return res.status(404).json({ error: 'Herramienta no encontrada' });
  res.json({ data: updated });
});

app.get('/api/stats', async (req, res) => {
  const db = await getDb();
  const includeHidden = req.query.includeHidden === 'true' && isAdmin(req);
  const visibleTools = db.tools.filter((tool) => includeHidden || tool.status === 'published');

  const byStatus = db.tools.reduce((acc, tool) => {
    acc[tool.status] = (acc[tool.status] || 0) + 1;
    return acc;
  }, {});

  const byCategory = db.categories.map((category) => {
    const count = visibleTools.filter((tool) => tool.categoryId === category.id).length;
    return {
      categoryId: category.id,
      name: category.name,
      count
    };
  });

  res.json({
    data: {
      categories: db.categories.length,
      tools: visibleTools.length,
      byStatus,
      byCategory
    }
  });
});

app.get('/api/export', requireAdmin, async (_req, res) => {
  const db = await getDb();
  res.json({ data: db });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
