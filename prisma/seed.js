import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from '../lib/initialData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DPK Shop Database Seeding...');

  // 1. Seed Users
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dpkshop.com' },
    update: {},
    create: {
      name: 'DPK Admin',
      email: 'admin@dpkshop.com',
      passwordHash: adminPasswordHash,
      phone: '+91 98765 00000',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@dpkshop.com' },
    update: {},
    create: {
      name: 'Rahul Deshmukh',
      email: 'customer@dpkshop.com',
      passwordHash: customerPasswordHash,
      phone: '+91 98765 11111',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users seeded: admin@dpkshop.com & customer@dpkshop.com');

  // 2. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
      },
    });
  }
  console.log('✅ Categories seeded');

  // 3. Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        sku: prod.sku,
        description: prod.description,
        details: prod.details,
        price: prod.price,
        salePrice: prod.salePrice,
        stock: prod.stock,
        categoryId: prod.categoryId,
        isPublished: prod.isPublished,
        isFeatured: prod.isFeatured,
        isTrending: prod.isTrending,
        isNewArrival: prod.isNewArrival,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        details: prod.details,
        price: prod.price,
        salePrice: prod.salePrice,
        stock: prod.stock,
        categoryId: prod.categoryId,
        isPublished: prod.isPublished,
        isFeatured: prod.isFeatured,
        isTrending: prod.isTrending,
        isNewArrival: prod.isNewArrival,
        images: {
          create: prod.images.map((img, idx) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
      },
    });
  }
  console.log('✅ Products & Images seeded');

  // 4. Seed Coupons
  for (const coup of INITIAL_COUPONS) {
    await prisma.coupon.upsert({
      where: { code: coup.code },
      update: {},
      create: {
        id: coup.id,
        code: coup.code,
        description: coup.description,
        discountType: coup.discountType,
        discountValue: coup.discountValue,
        minSpend: coup.minSpend,
        maxDiscount: coup.maxDiscount,
        usageLimit: coup.usageLimit,
        isActive: true,
      },
    });
  }
  console.log('✅ Promotional Coupons seeded');

  console.log('🎉 DPK Shop Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
