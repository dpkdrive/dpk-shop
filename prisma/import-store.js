import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting import from .data/store.json to PostgreSQL database...');

  const dataPath = path.join(process.cwd(), '.data', 'store.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found at: ${dataPath}`);
  }

  const raw = fs.readFileSync(dataPath, 'utf8');
  const store = JSON.parse(raw);

  // 1. IMPORT USERS
  console.log(`\n👤 Importing ${store.users?.length || 0} users...`);
  if (Array.isArray(store.users)) {
    for (const u of store.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          name: u.name,
          email: u.email.toLowerCase().trim(),
          passwordHash: u.passwordHash,
          phone: u.phone || null,
          role: u.role || 'CUSTOMER',
          createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email.toLowerCase().trim(),
          passwordHash: u.passwordHash,
          phone: u.phone || null,
          role: u.role || 'CUSTOMER',
          createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
        },
      });
      console.log(`  ✓ User: ${u.email} (${u.role})`);
    }
  }

  // 2. IMPORT ADDRESSES
  console.log(`\n📍 Importing ${store.addresses?.length || 0} addresses...`);
  if (Array.isArray(store.addresses)) {
    for (const addr of store.addresses) {
      // Check user exists
      const userExists = await prisma.user.findUnique({ where: { id: addr.userId } });
      if (!userExists) {
        console.warn(`  ⚠️ Skipped address ${addr.id}: user ${addr.userId} does not exist`);
        continue;
      }
      await prisma.address.upsert({
        where: { id: addr.id },
        update: {
          userId: addr.userId,
          fullName: addr.fullName,
          phone: addr.phone,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country || 'India',
          isDefault: Boolean(addr.isDefault),
          createdAt: addr.createdAt ? new Date(addr.createdAt) : undefined,
          updatedAt: addr.updatedAt ? new Date(addr.updatedAt) : undefined,
        },
        create: {
          id: addr.id,
          userId: addr.userId,
          fullName: addr.fullName,
          phone: addr.phone,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country || 'India',
          isDefault: Boolean(addr.isDefault),
          createdAt: addr.createdAt ? new Date(addr.createdAt) : undefined,
          updatedAt: addr.updatedAt ? new Date(addr.updatedAt) : undefined,
        },
      });
      console.log(`  ✓ Address: ${addr.fullName} - ${addr.city}`);
    }
  }

  // 3. IMPORT CATEGORIES
  console.log(`\n📂 Importing ${store.categories?.length || 0} categories...`);
  if (Array.isArray(store.categories)) {
    for (const cat of store.categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          image: cat.image || null,
          parentId: cat.parentId || null,
          createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
          updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : undefined,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          image: cat.image || null,
          parentId: cat.parentId || null,
          createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
          updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : undefined,
        },
      });
      console.log(`  ✓ Category: ${cat.name} (${cat.slug})`);
    }
  }

  // 4. IMPORT PRODUCTS & PRODUCT IMAGES & VARIANTS
  console.log(`\n📦 Importing ${store.products?.length || 0} products...`);
  if (Array.isArray(store.products)) {
    for (const prod of store.products) {
      const dbProduct = await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          description: prod.description || '',
          details: prod.details || null,
          price: prod.price,
          salePrice: prod.salePrice || null,
          stock: prod.stock || 0,
          lowStockAlert: prod.lowStockAlert ?? 5,
          isPublished: prod.isPublished !== false,
          isFeatured: Boolean(prod.isFeatured),
          isTrending: Boolean(prod.isTrending),
          isNewArrival: Boolean(prod.isNewArrival),
          categoryId: prod.categoryId,
          rating: prod.rating ?? 5.0,
          reviewsCount: prod.reviewsCount ?? 0,
          createdAt: prod.createdAt ? new Date(prod.createdAt) : undefined,
          updatedAt: prod.updatedAt ? new Date(prod.updatedAt) : undefined,
        },
        create: {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          description: prod.description || '',
          details: prod.details || null,
          price: prod.price,
          salePrice: prod.salePrice || null,
          stock: prod.stock || 0,
          lowStockAlert: prod.lowStockAlert ?? 5,
          isPublished: prod.isPublished !== false,
          isFeatured: Boolean(prod.isFeatured),
          isTrending: Boolean(prod.isTrending),
          isNewArrival: Boolean(prod.isNewArrival),
          categoryId: prod.categoryId,
          rating: prod.rating ?? 5.0,
          reviewsCount: prod.reviewsCount ?? 0,
          createdAt: prod.createdAt ? new Date(prod.createdAt) : undefined,
          updatedAt: prod.updatedAt ? new Date(prod.updatedAt) : undefined,
        },
      });

      // Import images
      if (Array.isArray(prod.images)) {
        for (let idx = 0; idx < prod.images.length; idx++) {
          const img = prod.images[idx];
          const imgId = `${dbProduct.id}-img-${idx}`;
          await prisma.productImage.upsert({
            where: { id: imgId },
            update: {
              productId: dbProduct.id,
              url: img.url,
              alt: img.alt || prod.name,
              isPrimary: Boolean(img.isPrimary || idx === 0),
              sortOrder: idx,
            },
            create: {
              id: imgId,
              productId: dbProduct.id,
              url: img.url,
              alt: img.alt || prod.name,
              isPrimary: Boolean(img.isPrimary || idx === 0),
              sortOrder: idx,
            },
          });
        }
      }

      // Import variants
      if (Array.isArray(prod.variants)) {
        for (let vIdx = 0; vIdx < prod.variants.length; vIdx++) {
          const v = prod.variants[vIdx];
          const varId = v.id || `${dbProduct.id}-var-${vIdx}`;
          if (v.sku) {
            await prisma.productVariant.upsert({
              where: { sku: v.sku },
              update: {
                productId: dbProduct.id,
                name: v.name,
                value: v.value,
                price: v.price ?? null,
                stock: v.stock ?? 0,
              },
              create: {
                id: varId,
                productId: dbProduct.id,
                name: v.name,
                value: v.value,
                sku: v.sku,
                price: v.price ?? null,
                stock: v.stock ?? 0,
              },
            });
          } else {
            await prisma.productVariant.upsert({
              where: { id: varId },
              update: {
                productId: dbProduct.id,
                name: v.name,
                value: v.value,
                price: v.price ?? null,
                stock: v.stock ?? 0,
              },
              create: {
                id: varId,
                productId: dbProduct.id,
                name: v.name,
                value: v.value,
                price: v.price ?? null,
                stock: v.stock ?? 0,
              },
            });
          }
        }
      }

      console.log(`  ✓ Product: ${prod.name} (${prod.sku})`);
    }
  }

  // 5. IMPORT COUPONS
  console.log(`\n🏷️ Importing ${store.coupons?.length || 0} coupons...`);
  if (Array.isArray(store.coupons)) {
    for (const coup of store.coupons) {
      await prisma.coupon.upsert({
        where: { code: coup.code },
        update: {
          description: coup.description || null,
          discountType: coup.discountType || 'PERCENTAGE',
          discountValue: coup.discountValue,
          minSpend: coup.minSpend ?? null,
          maxDiscount: coup.maxDiscount ?? null,
          usageLimit: coup.usageLimit ?? null,
          usageCount: coup.usageCount ?? 0,
          isActive: coup.isActive !== false,
          createdAt: coup.createdAt ? new Date(coup.createdAt) : undefined,
          updatedAt: coup.updatedAt ? new Date(coup.updatedAt) : undefined,
        },
        create: {
          id: coup.id,
          code: coup.code,
          description: coup.description || null,
          discountType: coup.discountType || 'PERCENTAGE',
          discountValue: coup.discountValue,
          minSpend: coup.minSpend ?? null,
          maxDiscount: coup.maxDiscount ?? null,
          usageLimit: coup.usageLimit ?? null,
          usageCount: coup.usageCount ?? 0,
          isActive: coup.isActive !== false,
          createdAt: coup.createdAt ? new Date(coup.createdAt) : undefined,
          updatedAt: coup.updatedAt ? new Date(coup.updatedAt) : undefined,
        },
      });
      console.log(`  ✓ Coupon: ${coup.code}`);
    }
  }

  // 6. IMPORT REVIEWS
  console.log(`\n⭐ Importing ${store.reviews?.length || 0} reviews...`);
  if (Array.isArray(store.reviews)) {
    for (const rev of store.reviews) {
      // Check if product exists
      const prodExists = await prisma.product.findUnique({ where: { id: rev.productId } });
      if (!prodExists) {
        console.warn(`  ⚠️ Skipped review ${rev.id}: product ${rev.productId} does not exist`);
        continue;
      }

      let userId = rev.userId || null;
      if (userId) {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) userId = null;
      }

      await prisma.review.upsert({
        where: { id: rev.id },
        update: {
          productId: rev.productId,
          userId: userId,
          userName: rev.userName || null,
          rating: Number(rev.rating) || 5,
          title: rev.title || null,
          comment: rev.comment || '',
          isVerified: Boolean(rev.isVerified),
          isApproved: rev.isApproved !== false,
          createdAt: rev.createdAt ? new Date(rev.createdAt) : undefined,
          updatedAt: rev.updatedAt ? new Date(rev.updatedAt) : undefined,
        },
        create: {
          id: rev.id,
          productId: rev.productId,
          userId: userId,
          userName: rev.userName || null,
          rating: Number(rev.rating) || 5,
          title: rev.title || null,
          comment: rev.comment || '',
          isVerified: Boolean(rev.isVerified),
          isApproved: rev.isApproved !== false,
          createdAt: rev.createdAt ? new Date(rev.createdAt) : undefined,
          updatedAt: rev.updatedAt ? new Date(rev.updatedAt) : undefined,
        },
      });
      console.log(`  ✓ Review: ${rev.id} (${rev.userName || 'Guest'} - ${rev.rating}★)`);
    }
  }

  // 7. IMPORT ORDERS & ORDER ITEMS
  console.log(`\n🛍️ Importing ${store.orders?.length || 0} orders...`);
  if (Array.isArray(store.orders)) {
    for (const ord of store.orders) {
      let userId = ord.userId || null;
      if (userId) {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) userId = null;
      }

      await prisma.order.upsert({
        where: { orderNumber: ord.orderNumber },
        update: {
          userId,
          customerName: ord.customerName || 'Customer',
          customerEmail: ord.customerEmail || '',
          customerPhone: ord.customerPhone || '',
          shippingStreet: ord.shippingStreet || '',
          shippingCity: ord.shippingCity || '',
          shippingState: ord.shippingState || '',
          shippingPincode: ord.shippingPincode || '',
          shippingCountry: ord.shippingCountry || 'India',
          subtotal: ord.subtotal || 0,
          discountTotal: ord.discountTotal || 0,
          shippingFee: ord.shippingFee || 0,
          taxTotal: ord.taxTotal || 0,
          totalAmount: ord.totalAmount || 0,
          orderStatus: ord.orderStatus || 'PENDING',
          paymentStatus: ord.paymentStatus || 'PENDING',
          paymentMethod: ord.paymentMethod || 'COD',
          couponCode: ord.couponCode || null,
          notes: ord.notes || null,
          trackingNumber: ord.trackingNumber || null,
          shippingCarrier: ord.shippingCarrier || null,
          createdAt: ord.createdAt ? new Date(ord.createdAt) : undefined,
          updatedAt: ord.updatedAt ? new Date(ord.updatedAt) : undefined,
        },
        create: {
          id: ord.id,
          orderNumber: ord.orderNumber,
          userId,
          customerName: ord.customerName || 'Customer',
          customerEmail: ord.customerEmail || '',
          customerPhone: ord.customerPhone || '',
          shippingStreet: ord.shippingStreet || '',
          shippingCity: ord.shippingCity || '',
          shippingState: ord.shippingState || '',
          shippingPincode: ord.shippingPincode || '',
          shippingCountry: ord.shippingCountry || 'India',
          subtotal: ord.subtotal || 0,
          discountTotal: ord.discountTotal || 0,
          shippingFee: ord.shippingFee || 0,
          taxTotal: ord.taxTotal || 0,
          totalAmount: ord.totalAmount || 0,
          orderStatus: ord.orderStatus || 'PENDING',
          paymentStatus: ord.paymentStatus || 'PENDING',
          paymentMethod: ord.paymentMethod || 'COD',
          couponCode: ord.couponCode || null,
          notes: ord.notes || null,
          trackingNumber: ord.trackingNumber || null,
          shippingCarrier: ord.shippingCarrier || null,
          createdAt: ord.createdAt ? new Date(ord.createdAt) : undefined,
          updatedAt: ord.updatedAt ? new Date(ord.updatedAt) : undefined,
        },
      });

      // Insert Order Items
      if (Array.isArray(ord.items)) {
        for (const it of ord.items) {
          // Check product exists
          const prodExists = await prisma.product.findUnique({ where: { id: it.productId } });
          if (!prodExists) {
            console.warn(`  ⚠️ Skipped order item ${it.id}: product ${it.productId} does not exist`);
            continue;
          }

          // Check variant if present
          let variantId = it.variantId || null;
          if (variantId) {
            const varExists = await prisma.productVariant.findUnique({ where: { id: variantId } });
            if (!varExists) variantId = null;
          }

          await prisma.orderItem.upsert({
            where: { id: it.id },
            update: {
              orderId: ord.id,
              productId: it.productId,
              variantId,
              productName: it.productName,
              variantName: it.variantName || null,
              price: it.price,
              quantity: it.quantity,
              total: it.total,
              imageUrl: it.imageUrl || null,
            },
            create: {
              id: it.id,
              orderId: ord.id,
              productId: it.productId,
              variantId,
              productName: it.productName,
              variantName: it.variantName || null,
              price: it.price,
              quantity: it.quantity,
              total: it.total,
              imageUrl: it.imageUrl || null,
            },
          });
        }
      }

      console.log(`  ✓ Order: ${ord.orderNumber} (₹${ord.totalAmount})`);
    }
  }

  // 8. IMPORT STORE SETTINGS
  console.log(`\n⚙️ Importing store settings...`);
  if (store.settings && typeof store.settings === 'object') {
    for (const [key, val] of Object.entries(store.settings)) {
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      await prisma.storeSetting.upsert({
        where: { key },
        update: { value: strVal },
        create: { key, value: strVal, description: `Setting for ${key}` },
      });
    }
    // Also store complete JSON
    await prisma.storeSetting.upsert({
      where: { key: 'STORE_SETTINGS_JSON' },
      update: { value: JSON.stringify(store.settings) },
      create: { key: 'STORE_SETTINGS_JSON', value: JSON.stringify(store.settings), description: 'Full settings object' },
    });
    console.log(`  ✓ Store settings saved (${Object.keys(store.settings).length} keys)`);
  }

  // 9. IMPORT NEWSLETTERS
  console.log(`\n📧 Importing newsletters...`);
  if (Array.isArray(store.newsletters)) {
    for (const email of store.newsletters) {
      const norm = email.toLowerCase().trim();
      await prisma.newsletterSubscription.upsert({
        where: { email: norm },
        update: { isActive: true },
        create: { email: norm, isActive: true },
      });
      console.log(`  ✓ Newsletter subscriber: ${norm}`);
    }
  }

  // 10. IMPORT WISHLISTS
  console.log(`\n❤️ Importing wishlists...`);
  if (store.wishlists && typeof store.wishlists === 'object') {
    for (const [userId, productIds] of Object.entries(store.wishlists)) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        console.warn(`  ⚠️ Skipped wishlist for user ${userId}: user does not exist`);
        continue;
      }

      const wishlist = await prisma.wishlist.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      if (Array.isArray(productIds)) {
        for (const prodId of productIds) {
          const prodExists = await prisma.product.findUnique({ where: { id: prodId } });
          if (!prodExists) continue;

          await prisma.wishlistItem.upsert({
            where: {
              wishlistId_productId: {
                wishlistId: wishlist.id,
                productId: prodId,
              },
            },
            update: {},
            create: {
              wishlistId: wishlist.id,
              productId: prodId,
            },
          });
        }
      }
      console.log(`  ✓ Wishlist for user ${userId}: ${productIds?.length || 0} items`);
    }
  }

  // 11. IMPORT AUDIT LOGS
  console.log(`\n📋 Importing audit logs...`);
  if (Array.isArray(store.auditLogs)) {
    for (const log of store.auditLogs) {
      const userExists = await prisma.user.findUnique({ where: { id: log.userId } });
      if (!userExists) {
        console.warn(`  ⚠️ Skipped audit log ${log.id}: user ${log.userId} does not exist`);
        continue;
      }

      await prisma.adminAuditLog.upsert({
        where: { id: log.id },
        update: {
          userId: log.userId,
          action: log.action,
          target: log.target || null,
          details: log.details || null,
          createdAt: log.createdAt ? new Date(log.createdAt) : undefined,
        },
        create: {
          id: log.id,
          userId: log.userId,
          action: log.action,
          target: log.target || null,
          details: log.details || null,
          createdAt: log.createdAt ? new Date(log.createdAt) : undefined,
        },
      });
      console.log(`  ✓ Audit log: ${log.action}`);
    }
  }

  console.log('\n🎉 ALL DATA FROM .data/store.json SUCCESSFULLY IMPORTED INTO POSTGRESQL DATABASE!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
