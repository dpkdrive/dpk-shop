import fs from 'fs';
import path from 'path';
import prisma from './prisma.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_STORE_SETTINGS,
} from './initialData.js';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure local store fallback file exists
function ensureLocalStore() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore
    }
  }

  if (!fs.existsSync(DATA_FILE)) {
    const adminHash = bcrypt.hashSync('Admin@12345', 10);
    const customerHash = bcrypt.hashSync('Customer@12345', 10);

    const initialStore = {
      users: [
        {
          id: 'usr-admin',
          name: 'DPK Admin',
          email: 'admin@dpkshop.com',
          passwordHash: adminHash,
          phone: '+91 98765 00000',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'usr-customer',
          name: 'Rahul Deshmukh',
          email: 'customer@dpkshop.com',
          passwordHash: customerHash,
          phone: '+91 98765 11111',
          role: 'CUSTOMER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      categories: INITIAL_CATEGORIES.map((c) => ({
        ...c,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      products: INITIAL_PRODUCTS.map((p) => ({
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      coupons: INITIAL_COUPONS.map((cp) => ({
        ...cp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      reviews: INITIAL_REVIEWS.map((r) => ({
        ...r,
        isApproved: true,
        updatedAt: new Date().toISOString(),
      })),
      orders: [],
      addresses: [],
      settings: INITIAL_STORE_SETTINGS,
      newsletters: ['vip@example.com'],
      wishlists: {},
      auditLogs: [],
    };

    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf8');
    } catch {
      // Ignore
    }
  }
}

function readLocalStore() {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {
      users: [],
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      orders: [],
      addresses: [],
      settings: INITIAL_STORE_SETTINGS,
      newsletters: [],
      wishlists: {},
      auditLogs: [],
    };
  }
}

function writeLocalStore(data) {
  try {
    ensureLocalStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

// Cached check for Prisma PostgreSQL connection
let prismaAvailable = null;
let lastCheck = 0;

export async function canUsePrisma() {
  const now = Date.now();
  if (prismaAvailable !== null && now - lastCheck < 30000) {
    return prismaAvailable;
  }
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('YOUR_PASSWORD') || dbUrl.includes('sample-pooler')) {
    prismaAvailable = false;
    lastCheck = now;
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    prismaAvailable = true;
    lastCheck = now;
    return true;
  } catch (err) {
    console.warn('Prisma check failed, falling back to local store:', err.message);
    prismaAvailable = false;
    lastCheck = now;
    return false;
  }
}

// Convert Decimal to regular numbers for Next.js JSON serialization
function sanitizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    price: p.price !== null && p.price !== undefined ? Number(p.price) : p.price,
    salePrice: p.salePrice !== null && p.salePrice !== undefined ? Number(p.salePrice) : null,
    rating: p.rating !== null && p.rating !== undefined ? Number(p.rating) : 5.0,
    reviewsCount: p.reviewsCount !== null && p.reviewsCount !== undefined ? Number(p.reviewsCount) : 0,
    variants: (p.variants || []).map((v) => ({
      ...v,
      price: v.price !== null && v.price !== undefined ? Number(v.price) : null,
    })),
  };
}

function sanitizeOrder(o) {
  if (!o) return null;
  return {
    ...o,
    subtotal: o.subtotal !== null && o.subtotal !== undefined ? Number(o.subtotal) : 0,
    discountTotal: o.discountTotal !== null && o.discountTotal !== undefined ? Number(o.discountTotal) : 0,
    shippingFee: o.shippingFee !== null && o.shippingFee !== undefined ? Number(o.shippingFee) : 0,
    taxTotal: o.taxTotal !== null && o.taxTotal !== undefined ? Number(o.taxTotal) : 0,
    totalAmount: o.totalAmount !== null && o.totalAmount !== undefined ? Number(o.totalAmount) : 0,
    items: (o.items || []).map((it) => ({
      ...it,
      price: it.price !== null && it.price !== undefined ? Number(it.price) : 0,
      total: it.total !== null && it.total !== undefined ? Number(it.total) : 0,
    })),
  };
}

function sanitizeCoupon(c) {
  if (!c) return null;
  return {
    ...c,
    discountValue: c.discountValue !== null && c.discountValue !== undefined ? Number(c.discountValue) : 0,
    minSpend: c.minSpend !== null && c.minSpend !== undefined ? Number(c.minSpend) : 0,
    maxDiscount: c.maxDiscount !== null && c.maxDiscount !== undefined ? Number(c.maxDiscount) : null,
  };
}

// -------------------------------------------------------------
// USER SERVICES
// -------------------------------------------------------------
export async function findUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  if (await canUsePrisma()) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalized },
        include: { addresses: true },
      });
      if (user) return user;
    } catch (e) {
      console.error('Error findUserByEmail in Prisma:', e.message);
    }
  }
  const store = readLocalStore();
  return store.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id) {
  if (await canUsePrisma()) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { addresses: true },
      });
      if (user) return user;
    } catch (e) {
      console.error('Error findUserById in Prisma:', e.message);
    }
  }
  const store = readLocalStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) return null;
  const addresses = store.addresses.filter((a) => a.userId === id);
  return { ...user, addresses };
}

export async function getAllUsers() {
  if (await canUsePrisma()) {
    try {
      return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { addresses: true },
      });
    } catch (e) {
      console.error('Error getAllUsers in Prisma:', e.message);
    }
  }
  const store = readLocalStore();
  return store.users || [];
}

export async function createUser(data) {
  const normalized = data.email.toLowerCase().trim();
  let createdUser = null;

  if (await canUsePrisma()) {
    try {
      createdUser = await prisma.user.create({
        data: {
          name: data.name,
          email: normalized,
          passwordHash: data.passwordHash,
          phone: data.phone || null,
          role: data.role || 'CUSTOMER',
        },
      });
    } catch (e) {
      console.error('Error createUser in Prisma:', e.message);
    }
  }

  // Backup to local store
  const store = readLocalStore();
  const newUser = createdUser || {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name,
    email: normalized,
    passwordHash: data.passwordHash,
    phone: data.phone || '',
    role: data.role || 'CUSTOMER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = store.users.findIndex((u) => u.email.toLowerCase() === normalized);
  if (existingIdx >= 0) {
    store.users[existingIdx] = newUser;
  } else {
    store.users.push(newUser);
  }
  writeLocalStore(store);

  return createdUser || newUser;
}

export async function updateUserProfile(userId, updateData) {
  if (await canUsePrisma()) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      return updated;
    } catch (e) {
      console.error('Error updateUserProfile in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const index = store.users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    store.users[index] = {
      ...store.users[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeLocalStore(store);
    return store.users[index];
  }
  return null;
}

// -------------------------------------------------------------
// ADDRESS SERVICES
// -------------------------------------------------------------
export async function getUserAddresses(userId) {
  if (await canUsePrisma()) {
    try {
      return await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
    } catch (e) {
      console.error('Error getUserAddresses in Prisma:', e.message);
    }
  }
  const store = readLocalStore();
  return store.addresses.filter((a) => a.userId === userId);
}

export async function saveAddress(addrData) {
  if (await canUsePrisma()) {
    try {
      if (addrData.isDefault) {
        await prisma.address.updateMany({
          where: { userId: addrData.userId },
          data: { isDefault: false },
        });
      }
      if (addrData.id) {
        return await prisma.address.update({
          where: { id: addrData.id },
          data: addrData,
        });
      }
      return await prisma.address.create({ data: addrData });
    } catch (e) {
      console.error('Error saveAddress in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  if (addrData.isDefault) {
    store.addresses.forEach((a) => {
      if (a.userId === addrData.userId) a.isDefault = false;
    });
  }
  const newAddr = {
    id: addrData.id || `addr-${Date.now()}`,
    ...addrData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addresses.push(newAddr);
  writeLocalStore(store);
  return newAddr;
}

export async function deleteAddress(id) {
  if (await canUsePrisma()) {
    try {
      await prisma.address.delete({ where: { id } });
      return true;
    } catch (e) {
      console.error('Error deleteAddress in Prisma:', e.message);
    }
  }
  const store = readLocalStore();
  store.addresses = store.addresses.filter((a) => a.id !== id);
  writeLocalStore(store);
  return true;
}

// -------------------------------------------------------------
// PRODUCT SERVICES
// -------------------------------------------------------------
export async function getProducts(options = {}) {
  const {
    categorySlug,
    search,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    inStockOnly,
    featuredOnly,
    trendingOnly,
    page = 1,
    limit = 12,
  } = options;

  if (await canUsePrisma()) {
    try {
      const where = { isPublished: true };
      if (categorySlug && categorySlug !== 'all') {
        where.category = { slug: categorySlug };
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (featuredOnly) where.isFeatured = true;
      if (trendingOnly) where.isTrending = true;
      if (inStockOnly) where.stock = { gt: 0 };
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined && minPrice !== null) where.price.gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== null) where.price.lte = Number(maxPrice);
      }

      let orderBy = { createdAt: 'desc' };
      if (sortBy === 'price_asc') orderBy = { price: 'asc' };
      if (sortBy === 'price_desc') orderBy = { price: 'desc' };
      if (sortBy === 'rating') orderBy = { rating: 'desc' };

      const [total, rawProducts] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            category: true,
            images: { orderBy: { sortOrder: 'asc' } },
            variants: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
        }),
      ]);

      const products = rawProducts.map(sanitizeProduct);

      return {
        products,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
          limit,
        },
      };
    } catch (e) {
      console.error('Error getProducts in Prisma:', e.message);
    }
  }

  // Fallback to local store
  const store = readLocalStore();
  let list = [...store.products].filter((p) => p.isPublished !== false);

  if (categorySlug && categorySlug !== 'all') {
    const cat = store.categories.find((c) => c.slug === categorySlug);
    if (cat) {
      list = list.filter((p) => p.categoryId === cat.id);
    }
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (minPrice !== undefined && minPrice !== null) {
    list = list.filter((p) => (p.salePrice || p.price) >= Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    list = list.filter((p) => (p.salePrice || p.price) <= Number(maxPrice));
  }
  if (inStockOnly) {
    list = list.filter((p) => p.stock > 0);
  }
  if (featuredOnly) {
    list = list.filter((p) => p.isFeatured);
  }
  if (trendingOnly) {
    list = list.filter((p) => p.isTrending);
  }

  if (sortBy === 'price_asc') {
    list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  } else if (sortBy === 'price_desc') {
    list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  } else if (sortBy === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  const enriched = paginated.map((p) => {
    const category = store.categories.find((c) => c.id === p.categoryId) || null;
    return { ...p, category };
  });

  return {
    products: enriched,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      limit,
    },
  };
}

export async function getProductBySlug(slug) {
  if (await canUsePrisma()) {
    try {
      const prod = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
        },
      });
      if (prod) {
        const related = await prisma.product.findMany({
          where: {
            categoryId: prod.categoryId,
            id: { not: prod.id },
            isPublished: true,
          },
          include: { category: true, images: true },
          take: 4,
        });

        return {
          ...sanitizeProduct(prod),
          relatedProducts: related.map(sanitizeProduct),
        };
      }
    } catch (e) {
      console.error('Error getProductBySlug in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const prod = store.products.find((p) => p.slug === slug);
  if (!prod) return null;

  const category = store.categories.find((c) => c.id === prod.categoryId) || null;
  const reviews = store.reviews.filter((r) => r.productId === prod.id && r.isApproved);
  const related = store.products
    .filter((p) => p.categoryId === prod.categoryId && p.id !== prod.id)
    .slice(0, 4);

  return {
    ...prod,
    category,
    reviews,
    relatedProducts: related,
  };
}

export async function getProductById(id) {
  if (await canUsePrisma()) {
    try {
      const prod = await prisma.product.findUnique({
        where: { id },
        include: { category: true, images: true, variants: true },
      });
      if (prod) return sanitizeProduct(prod);
    } catch (e) {
      console.error('Error getProductById in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const prod = store.products.find((p) => p.id === id);
  if (!prod) return null;
  const category = store.categories.find((c) => c.id === prod.categoryId) || null;
  return { ...prod, category };
}

export async function createProduct(productData) {
  let baseSlug = (
    productData.slug ||
    productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  ) || `prod-${Date.now()}`;

  let slug = baseSlug;

  if (await canUsePrisma()) {
    try {
      // Ensure slug is unique
      let counter = 1;
      while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }

      // Ensure sku is unique
      let sku = productData.sku || `DPK-${Math.floor(100000 + Math.random() * 900000)}`;
      while (await prisma.product.findUnique({ where: { sku } })) {
        sku = `DPK-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      const imagesList = Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : [
            {
              url: productData.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
              alt: productData.name,
              isPrimary: true,
            },
          ];

      const createdProduct = await prisma.product.create({
        data: {
          name: productData.name,
          slug,
          sku,
          description: productData.description || '',
          details: productData.details || '',
          price: Number(productData.price),
          salePrice: productData.salePrice ? Number(productData.salePrice) : null,
          stock: Number(productData.stock || 0),
          lowStockAlert: Number(productData.lowStockAlert || 5),
          isPublished: productData.isPublished !== false,
          isFeatured: Boolean(productData.isFeatured),
          isTrending: Boolean(productData.isTrending),
          isNewArrival: Boolean(productData.isNewArrival),
          categoryId: productData.categoryId,
          images: {
            create: imagesList.map((img, idx) => ({
              url: img.url,
              alt: img.alt || productData.name,
              isPrimary: Boolean(img.isPrimary || idx === 0),
              sortOrder: idx,
            })),
          },
          variants: {
            create: (productData.variants || []).map((v) => ({
              name: v.name,
              value: v.value,
              sku: v.sku || null,
              price: v.price ? Number(v.price) : null,
              stock: v.stock ? Number(v.stock) : 0,
            })),
          },
        },
        include: { category: true, images: true, variants: true },
      });

      // Also backup to local store
      try {
        const store = readLocalStore();
        store.products.unshift(sanitizeProduct(createdProduct));
        writeLocalStore(store);
      } catch {
        // Ignore local store error
      }

      return sanitizeProduct(createdProduct);
    } catch (e) {
      console.error('Error createProduct in Prisma:', e);
      throw new Error(`Database error creating product: ${e.message}`);
    }
  }

  // Backup to local store if Prisma is not connected
  const store = readLocalStore();
  const fallbackProduct = {
    id: `prod-${Date.now()}`,
    name: productData.name,
    slug,
    sku: productData.sku || `DPK-${Date.now().toString().slice(-6)}`,
    description: productData.description || '',
    details: productData.details || '',
    price: Number(productData.price),
    salePrice: productData.salePrice ? Number(productData.salePrice) : null,
    stock: Number(productData.stock || 0),
    lowStockAlert: Number(productData.lowStockAlert || 5),
    isPublished: productData.isPublished !== false,
    isFeatured: Boolean(productData.isFeatured),
    isTrending: Boolean(productData.isTrending),
    isNewArrival: Boolean(productData.isNewArrival),
    categoryId: productData.categoryId,
    images: productData.images || [
      {
        id: `img-${Date.now()}`,
        url: productData.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        alt: productData.name,
        isPrimary: true,
      },
    ],
    variants: productData.variants || [],
    rating: 5.0,
    reviewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.products.unshift(fallbackProduct);
  writeLocalStore(store);

  return fallbackProduct;
}

export async function updateProduct(id, updates) {
  let updatedProd = null;

  if (await canUsePrisma()) {
    try {
      const data = {};
      if (updates.name) data.name = updates.name;
      if (updates.slug) data.slug = updates.slug;
      if (updates.sku) data.sku = updates.sku;
      if (updates.description !== undefined) data.description = updates.description;
      if (updates.details !== undefined) data.details = updates.details;
      if (updates.price !== undefined) data.price = Number(updates.price);
      if (updates.salePrice !== undefined) data.salePrice = updates.salePrice ? Number(updates.salePrice) : null;
      if (updates.stock !== undefined) data.stock = Number(updates.stock);
      if (updates.lowStockAlert !== undefined) data.lowStockAlert = Number(updates.lowStockAlert);
      if (updates.isPublished !== undefined) data.isPublished = Boolean(updates.isPublished);
      if (updates.isFeatured !== undefined) data.isFeatured = Boolean(updates.isFeatured);
      if (updates.isTrending !== undefined) data.isTrending = Boolean(updates.isTrending);
      if (updates.isNewArrival !== undefined) data.isNewArrival = Boolean(updates.isNewArrival);
      if (updates.categoryId) data.categoryId = updates.categoryId;

      updatedProd = await prisma.product.update({
        where: { id },
        data,
        include: { category: true, images: true, variants: true },
      });
    } catch (e) {
      console.error('Error updateProduct in Prisma:', e.message);
    }
  }

  // Backup to local store
  const store = readLocalStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index !== -1) {
    store.products[index] = {
      ...store.products[index],
      ...updates,
      price: updates.price ? Number(updates.price) : store.products[index].price,
      salePrice:
        updates.salePrice !== undefined
          ? updates.salePrice ? Number(updates.salePrice) : null
          : store.products[index].salePrice,
      stock: updates.stock !== undefined ? Number(updates.stock) : store.products[index].stock,
      updatedAt: new Date().toISOString(),
    };
    writeLocalStore(store);
    return updatedProd ? sanitizeProduct(updatedProd) : store.products[index];
  }

  return updatedProd ? sanitizeProduct(updatedProd) : null;
}

export async function deleteProduct(id) {
  if (await canUsePrisma()) {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (e) {
      console.error('Error deleteProduct in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const filtered = store.products.filter((p) => p.id !== id);
  if (filtered.length !== store.products.length) {
    store.products = filtered;
    writeLocalStore(store);
    return true;
  }
  return true;
}

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
export async function getCategories() {
  if (await canUsePrisma()) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      return categories.map((c) => ({
        ...c,
        productCount: c._count?.products || 0,
      }));
    } catch (e) {
      console.error('Error getCategories in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  return store.categories.map((c) => {
    const count = store.products.filter((p) => p.categoryId === c.id).length;
    return { ...c, productCount: count };
  });
}

export async function getCategoryBySlug(slug) {
  if (await canUsePrisma()) {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          products: {
            where: { isPublished: true },
            include: { images: true, variants: true, category: true },
          },
        },
      });
      if (category) {
        return {
          ...category,
          products: category.products.map(sanitizeProduct),
          productCount: category.products.length,
        };
      }
    } catch (e) {
      console.error('Error getCategoryBySlug in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const category = store.categories.find((c) => c.slug === slug);
  if (!category) return null;
  const products = store.products.filter((p) => p.categoryId === category.id && p.isPublished !== false);
  return { ...category, products, productCount: products.length };
}

export async function createCategory(catData) {
  const slug =
    catData.slug ||
    catData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  let createdCat = null;
  if (await canUsePrisma()) {
    try {
      createdCat = await prisma.category.create({
        data: {
          name: catData.name,
          slug,
          description: catData.description || null,
          image: catData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        },
      });
    } catch (e) {
      console.error('Error createCategory in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const newCat = createdCat || {
    id: `cat-${Date.now()}`,
    name: catData.name,
    slug,
    description: catData.description || '',
    image: catData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.categories.push(newCat);
  writeLocalStore(store);
  return createdCat || newCat;
}

export async function updateCategory(id, updates) {
  let updatedCat = null;
  if (await canUsePrisma()) {
    try {
      updatedCat = await prisma.category.update({
        where: { id },
        data: updates,
      });
    } catch (e) {
      console.error('Error updateCategory in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const index = store.categories.findIndex((c) => c.id === id);
  if (index !== -1) {
    store.categories[index] = {
      ...store.categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeLocalStore(store);
    return updatedCat || store.categories[index];
  }
  return updatedCat || null;
}

export async function deleteCategory(id) {
  if (await canUsePrisma()) {
    try {
      await prisma.category.delete({ where: { id } });
    } catch (e) {
      console.error('Error deleteCategory in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  store.categories = store.categories.filter((c) => c.id !== id);
  writeLocalStore(store);
  return true;
}

// -------------------------------------------------------------
// COUPONS
// -------------------------------------------------------------
export async function validateCoupon(code, subtotal) {
  if (!code) return { valid: false, message: 'Coupon code required' };
  const cleanCode = code.toUpperCase().trim();

  let coupon = null;
  if (await canUsePrisma()) {
    try {
      const dbCoupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });
      if (dbCoupon && dbCoupon.isActive) {
        coupon = sanitizeCoupon(dbCoupon);
      }
    } catch (e) {
      console.error('Error validateCoupon in Prisma:', e.message);
    }
  }

  if (!coupon) {
    const store = readLocalStore();
    coupon = store.coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
  }

  if (!coupon) {
    return { valid: false, message: 'Invalid or expired coupon code' };
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return {
      valid: false,
      message: `Minimum order spend of ₹${coupon.minSpend} required for this coupon`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return {
    valid: true,
    code: coupon.code,
    discountAmount: Math.min(discount, subtotal),
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    coupon,
  };
}

export async function getCoupons() {
  if (await canUsePrisma()) {
    try {
      const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
      return coupons.map(sanitizeCoupon);
    } catch (e) {
      console.error('Error getCoupons in Prisma:', e.message);
    }
  }
  const store = readLocalStore();
  return store.coupons;
}

export async function createCoupon(couponData) {
  const code = couponData.code.toUpperCase().trim();
  let createdCoupon = null;

  if (await canUsePrisma()) {
    try {
      createdCoupon = await prisma.coupon.create({
        data: {
          code,
          description: couponData.description || '',
          discountType: couponData.discountType || 'PERCENTAGE',
          discountValue: Number(couponData.discountValue),
          minSpend: couponData.minSpend ? Number(couponData.minSpend) : 0,
          maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : null,
          usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : 100,
          usageCount: 0,
          isActive: couponData.isActive !== false,
        },
      });
    } catch (e) {
      console.error('Error createCoupon in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const newCoupon = createdCoupon ? sanitizeCoupon(createdCoupon) : {
    id: `coup-${Date.now()}`,
    code,
    description: couponData.description || '',
    discountType: couponData.discountType || 'PERCENTAGE',
    discountValue: Number(couponData.discountValue),
    minSpend: couponData.minSpend ? Number(couponData.minSpend) : 0,
    maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : null,
    usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : 100,
    usageCount: 0,
    isActive: couponData.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.coupons.push(newCoupon);
  writeLocalStore(store);
  return createdCoupon ? sanitizeCoupon(createdCoupon) : newCoupon;
}

export async function deleteCoupon(id) {
  if (await canUsePrisma()) {
    try {
      await prisma.coupon.delete({ where: { id } });
    } catch (e) {
      console.error('Error deleteCoupon in Prisma:', e.message);
    }
  }
  const store = readLocalStore();
  store.coupons = store.coupons.filter((c) => c.id !== id);
  writeLocalStore(store);
  return true;
}

// -------------------------------------------------------------
// ORDERS & CHECKOUT
// -------------------------------------------------------------
export async function createOrder(orderPayload) {
  let createdOrder = null;
  const orderNumber = `DPK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  if (await canUsePrisma()) {
    try {
      // Validate items and verify stocks directly in PostgreSQL
      let calculatedSubtotal = 0;
      const orderItemsData = [];

      for (const item of orderPayload.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { images: true },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} is no longer available`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`);
        }

        const unitPrice = Number(product.salePrice || product.price);
        const itemTotal = unitPrice * item.quantity;
        calculatedSubtotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          variantName: item.variantName || null,
          price: unitPrice,
          quantity: item.quantity,
          total: itemTotal,
          imageUrl: product.images?.[0]?.url || '',
        });
      }

      // Calculate discounts
      let discountTotal = 0;
      if (orderPayload.couponCode) {
        const couponRes = await validateCoupon(orderPayload.couponCode, calculatedSubtotal);
        if (couponRes.valid) {
          discountTotal = couponRes.discountAmount;
          await prisma.coupon.update({
            where: { code: couponRes.code },
            data: { usageCount: { increment: 1 } },
          }).catch(() => {});
        }
      }

      const shippingFee = calculatedSubtotal >= 999 ? 0 : 99;
      const taxTotal = Math.round((calculatedSubtotal - discountTotal) * 0.18 * 100) / 100;
      const totalAmount = Math.max(0, calculatedSubtotal - discountTotal + shippingFee);

      // Verify if userId exists in PostgreSQL
      let validUserId = null;
      if (orderPayload.userId) {
        const userExists = await prisma.user.findUnique({ where: { id: orderPayload.userId } });
        if (userExists) validUserId = orderPayload.userId;
      }

      // Create Order with OrderItems in PostgreSQL
      createdOrder = await prisma.order.create({
        data: {
          orderNumber,
          userId: validUserId,
          customerName: orderPayload.customerName,
          customerEmail: orderPayload.customerEmail,
          customerPhone: orderPayload.customerPhone,
          shippingStreet: orderPayload.shippingStreet,
          shippingCity: orderPayload.shippingCity,
          shippingState: orderPayload.shippingState,
          shippingPincode: orderPayload.shippingPincode,
          shippingCountry: orderPayload.shippingCountry || 'India',
          subtotal: calculatedSubtotal,
          discountTotal,
          shippingFee,
          taxTotal,
          totalAmount,
          orderStatus: 'CONFIRMED',
          paymentStatus: orderPayload.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          paymentMethod: orderPayload.paymentMethod || 'RAZORPAY',
          couponCode: orderPayload.couponCode || null,
          notes: orderPayload.notes || null,
          trackingNumber: `DPK-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
          shippingCarrier: 'Delhivery / BlueDart',
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true, payments: true },
      });

      // Decrement product stock in PostgreSQL
      for (const item of orderPayload.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error createOrder in Prisma:', e.message);
      if (!e.message.includes('Prisma') && !e.message.includes('connect')) {
        throw e; // rethrow business errors like insufficient stock
      }
    }
  }

  // Backup to local store
  const store = readLocalStore();
  let calculatedSubtotal = 0;
  const processedItems = [];

  for (const item of orderPayload.items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (product) {
      const unitPrice = product.salePrice || product.price;
      const itemTotal = unitPrice * item.quantity;
      calculatedSubtotal += itemTotal;
      processedItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        variantName: item.variantName || null,
        price: unitPrice,
        quantity: item.quantity,
        total: itemTotal,
        imageUrl: product.images?.[0]?.url || '',
        slug: product.slug,
      });
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  }

  const shippingFee = calculatedSubtotal >= 999 ? 0 : 99;
  const discountTotal = orderPayload.discountTotal || 0;
  const taxTotal = Math.round((calculatedSubtotal - discountTotal) * 0.18 * 100) / 100;
  const totalAmount = Math.max(0, calculatedSubtotal - discountTotal + shippingFee);

  const newOrder = createdOrder ? sanitizeOrder(createdOrder) : {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId: orderPayload.userId || null,
    customerName: orderPayload.customerName,
    customerEmail: orderPayload.customerEmail,
    customerPhone: orderPayload.customerPhone,
    shippingStreet: orderPayload.shippingStreet,
    shippingCity: orderPayload.shippingCity,
    shippingState: orderPayload.shippingState,
    shippingPincode: orderPayload.shippingPincode,
    shippingCountry: orderPayload.shippingCountry || 'India',
    subtotal: calculatedSubtotal,
    discountTotal,
    shippingFee,
    taxTotal,
    totalAmount,
    orderStatus: 'CONFIRMED',
    paymentStatus: orderPayload.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
    paymentMethod: orderPayload.paymentMethod || 'RAZORPAY',
    couponCode: orderPayload.couponCode || null,
    notes: orderPayload.notes || null,
    trackingNumber: `DPK-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    shippingCarrier: 'Delhivery / BlueDart',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: processedItems,
    payments: orderPayload.paymentDetails ? [orderPayload.paymentDetails] : [],
  };

  store.orders.unshift(newOrder);
  writeLocalStore(store);

  return createdOrder ? sanitizeOrder(createdOrder) : newOrder;
}

export async function getOrders(options = {}) {
  if (await canUsePrisma()) {
    try {
      const where = {};
      if (options.userId) where.userId = options.userId;
      if (options.status) where.orderStatus = options.status;
      if (options.paymentStatus) where.paymentStatus = options.paymentStatus;

      const orders = await prisma.order.findMany({
        where,
        include: { items: true, payments: true },
        orderBy: { createdAt: 'desc' },
      });
      return orders.map(sanitizeOrder);
    } catch (e) {
      console.error('Error getOrders in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  let list = [...store.orders];
  if (options.userId) list = list.filter((o) => o.userId === options.userId);
  if (options.status) list = list.filter((o) => o.orderStatus === options.status);
  if (options.paymentStatus) list = list.filter((o) => o.paymentStatus === options.paymentStatus);
  return list;
}

export async function getOrderById(idOrOrderNumber) {
  if (await canUsePrisma()) {
    try {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: idOrOrderNumber }, { orderNumber: idOrOrderNumber }],
        },
        include: { items: true, payments: true },
      });
      if (order) return sanitizeOrder(order);
    } catch (e) {
      console.error('Error getOrderById in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  return (
    store.orders.find(
      (o) => o.id === idOrOrderNumber || o.orderNumber === idOrOrderNumber
    ) || null
  );
}

export async function updateOrderStatus(orderId, updateData) {
  let updatedOrder = null;
  if (await canUsePrisma()) {
    try {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: { items: true, payments: true },
      });
    } catch (e) {
      console.error('Error updateOrderStatus in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const index = store.orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    store.orders[index] = {
      ...store.orders[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeLocalStore(store);
    return updatedOrder ? sanitizeOrder(updatedOrder) : store.orders[index];
  }

  return updatedOrder ? sanitizeOrder(updatedOrder) : null;
}

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------
export async function addReview(reviewData) {
  let createdRev = null;

  if (await canUsePrisma()) {
    try {
      let userId = reviewData.userId || null;
      if (userId) {
        const u = await prisma.user.findUnique({ where: { id: userId } });
        if (!u) userId = null;
      }

      createdRev = await prisma.review.create({
        data: {
          productId: reviewData.productId,
          userId,
          userName: reviewData.userName || null,
          rating: Number(reviewData.rating),
          title: reviewData.title || '',
          comment: reviewData.comment || '',
          isVerified: Boolean(reviewData.isVerified),
          isApproved: true,
        },
      });

      // Recalculate average rating on product in PostgreSQL
      const allReviews = await prisma.review.findMany({
        where: { productId: reviewData.productId, isApproved: true },
      });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await prisma.product.update({
        where: { id: reviewData.productId },
        data: {
          rating: Math.round(avg * 10) / 10,
          reviewsCount: allReviews.length,
        },
      }).catch(() => {});
    } catch (e) {
      console.error('Error addReview in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const newReview = createdRev || {
    id: `rev-${Date.now()}`,
    productId: reviewData.productId,
    userName: reviewData.userName,
    userId: reviewData.userId || null,
    rating: Number(reviewData.rating),
    title: reviewData.title || '',
    comment: reviewData.comment,
    isVerified: Boolean(reviewData.isVerified),
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.reviews.unshift(newReview);

  const productReviews = store.reviews.filter((r) => r.productId === reviewData.productId && r.isApproved);
  const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  const prod = store.products.find((p) => p.id === reviewData.productId);
  if (prod) {
    prod.rating = Math.round(avg * 10) / 10;
    prod.reviewsCount = productReviews.length;
  }

  writeLocalStore(store);
  return createdRev || newReview;
}

export async function getReviews(productId) {
  if (await canUsePrisma()) {
    try {
      const where = { isApproved: true };
      if (productId) where.productId = productId;
      return await prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('Error getReviews in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  if (productId) {
    return store.reviews.filter((r) => r.productId === productId);
  }
  return store.reviews;
}

// -------------------------------------------------------------
// WISHLIST & NEWSLETTER
// -------------------------------------------------------------
export async function getWishlist(userId) {
  if (await canUsePrisma()) {
    try {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true, images: true, variants: true },
              },
            },
          },
        },
      });
      if (wishlist) {
        return (wishlist.items || []).map((it) => sanitizeProduct(it.product)).filter(Boolean);
      }
    } catch (e) {
      console.error('Error getWishlist in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const ids = store.wishlists[userId] || [];
  return store.products.filter((p) => ids.includes(p.id));
}

export async function toggleWishlistItem(userId, productId) {
  let isWishlisted = false;
  let count = 0;

  if (await canUsePrisma()) {
    try {
      const wishlist = await prisma.wishlist.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      const existing = await prisma.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId,
          },
        },
      });

      if (existing) {
        await prisma.wishlistItem.delete({
          where: { id: existing.id },
        });
        isWishlisted = false;
      } else {
        await prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId,
          },
        });
        isWishlisted = true;
      }

      count = await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } });
      return { isWishlisted, count };
    } catch (e) {
      console.error('Error toggleWishlistItem in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  if (!store.wishlists[userId]) {
    store.wishlists[userId] = [];
  }
  const index = store.wishlists[userId].indexOf(productId);
  if (index > -1) {
    store.wishlists[userId].splice(index, 1);
    isWishlisted = false;
  } else {
    store.wishlists[userId].push(productId);
    isWishlisted = true;
  }

  writeLocalStore(store);
  return { isWishlisted, count: store.wishlists[userId].length };
}

export async function subscribeNewsletter(email) {
  const normalized = email.toLowerCase().trim();
  if (await canUsePrisma()) {
    try {
      await prisma.newsletterSubscription.upsert({
        where: { email: normalized },
        update: { isActive: true },
        create: { email: normalized, isActive: true },
      });
    } catch (e) {
      console.error('Error subscribeNewsletter in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  if (!store.newsletters.includes(normalized)) {
    store.newsletters.push(normalized);
    writeLocalStore(store);
  }
  return true;
}

// -------------------------------------------------------------
// ADMIN METRICS
// -------------------------------------------------------------
export async function getAdminMetrics() {
  if (await canUsePrisma()) {
    try {
      const [
        totalOrders,
        paidOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        recentOrders,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.findMany({
          where: { paymentStatus: 'PAID' },
          select: { totalAmount: true },
        }),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.product.count({ where: { isPublished: true } }),
        prisma.product.findMany({
          where: { stock: { lte: 5 } },
          include: { category: true, images: true },
          take: 10,
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        }),
      ]);

      const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

      return {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map(sanitizeProduct),
        recentOrders: recentOrders.map(sanitizeOrder),
      };
    } catch (e) {
      console.error('Error getAdminMetrics in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  const totalOrders = store.orders.length;
  const totalRevenue = store.orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalCustomers = store.users.filter((u) => u.role === 'CUSTOMER').length;
  const totalProducts = store.products.length;
  const lowStockProducts = store.products.filter((p) => p.stock <= (p.lowStockAlert || 5));
  const recentOrders = store.orders.slice(0, 5);

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCustomers,
    totalProducts,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    recentOrders,
  };
}

export async function getStoreSettings() {
  if (await canUsePrisma()) {
    try {
      const settingsRows = await prisma.storeSetting.findMany();
      if (settingsRows.length > 0) {
        const full = settingsRows.find((r) => r.key === 'STORE_SETTINGS_JSON');
        if (full?.value) {
          try {
            return JSON.parse(full.value);
          } catch {
            // Fallback
          }
        }
        const settings = {};
        for (const row of settingsRows) {
          settings[row.key] = row.value;
        }
        return { ...INITIAL_STORE_SETTINGS, ...settings };
      }
    } catch (e) {
      console.error('Error getStoreSettings in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  return store.settings || INITIAL_STORE_SETTINGS;
}

export async function updateStoreSettings(updates) {
  if (await canUsePrisma()) {
    try {
      for (const [k, v] of Object.entries(updates)) {
        const strVal = typeof v === 'object' ? JSON.stringify(v) : String(v);
        await prisma.storeSetting.upsert({
          where: { key: k },
          update: { value: strVal },
          create: { key: k, value: strVal },
        });
      }
      const allSettings = await getStoreSettings();
      const merged = { ...allSettings, ...updates };
      await prisma.storeSetting.upsert({
        where: { key: 'STORE_SETTINGS_JSON' },
        update: { value: JSON.stringify(merged) },
        create: { key: 'STORE_SETTINGS_JSON', value: JSON.stringify(merged) },
      });
    } catch (e) {
      console.error('Error updateStoreSettings in Prisma:', e.message);
    }
  }

  const store = readLocalStore();
  store.settings = { ...store.settings, ...updates };
  writeLocalStore(store);
  return store.settings;
}
