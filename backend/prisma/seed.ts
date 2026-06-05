import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing records...');
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Common passwords
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const ownerPassword = await bcrypt.hash('Owner@1234', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: '100 Admin HQ Blvd, Tech District, San Francisco, CA 94103',
      role: Role.ADMIN,
    },
  });

  // 2. Create Store Owners
  const ownersData = [
    { name: 'Johnathan Store Owner', email: 'owner@storerating.com', address: '456 Commerce Ave, Business Park, NY 10001' },
    { name: 'Sarah Jenkins', email: 'owner2@storerating.com', address: '789 Retail Row, Shopping Complex, LA 90001' },
    { name: 'David Miller', email: 'owner3@storerating.com', address: '12 Market Lane, Commercial Plaza, Chicago, IL 60601' },
    { name: 'Emma Watson', email: 'owner4@storerating.com', address: '55 High Street, Downtown Square, Seattle, WA 98101' },
  ];

  const owners: any[] = [];
  for (const o of ownersData) {
    const owner = await prisma.user.create({
      data: {
        name: o.name,
        email: o.email,
        password: ownerPassword,
        address: o.address,
        role: Role.STORE_OWNER,
      },
    });
    owners.push(owner);
  }

  // 3. Create Normal Users
  const usersData = [
    { name: 'Jane Doe Regular Customer', email: 'user@storerating.com', address: '789 Main Street, Residential Area, TX 75001' },
    { name: 'Alex Johnson', email: 'user2@storerating.com', address: '102 Pine Road, Suburbia, WA 98002' },
    { name: 'Robert Smith', email: 'user3@storerating.com', address: '404 Cedar Court, Apartment 4B, FL 33101' },
    { name: 'Emily Davis', email: 'user4@storerating.com', address: '567 Elm Way, Metro Village, IL 60611' },
    { name: 'Michael Brown', email: 'user5@storerating.com', address: '88 Oak Lane, Countryside, OH 43201' },
    { name: 'Jessica Wilson', email: 'user6@storerating.com', address: '123 Birch Boulevard, Coastal City, CA 90210' },
    { name: 'William Taylor', email: 'user7@storerating.com', address: '15 Maple Street, Hillside, CO 80202' },
    { name: 'Olivia Thomas', email: 'user8@storerating.com', address: '98 Walnut Avenue, Riverside, MA 02110' },
    { name: 'James Anderson', email: 'user9@storerating.com', address: '321 Cypress Street, Green Valley, AZ 85001' },
    { name: 'Sophia Martinez', email: 'user10@storerating.com', address: '64 Redwood Highway, Sunnyvale, CA 94086' },
  ];

  const users: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: userPassword,
        address: u.address,
        role: Role.USER,
      },
    });
    users.push(user);
  }

  // 4. Create Stores (assigned to owners)
  const storesData = [
    { name: 'Gourmet Garden Bistro', email: 'gardenbistro@stores.com', address: '12 Culinary Circle, Foodie Haven, NY 10013', ownerId: owners[0].id },
    { name: 'Apex Tech Depot', email: 'apextech@stores.com', address: '404 Silicon Lane, Cyber City, NY 10001', ownerId: owners[0].id },
    { name: 'Super Mart Central', email: 'supermart@stores.com', address: '500 Convenience Way, Central Mall, LA 90024', ownerId: owners[1].id },
    { name: 'FitLife Fitness Gym', email: 'fitlife@stores.com', address: '88 Health Highway, Gym District, LA 90001', ownerId: owners[1].id },
    { name: 'The Cozy Coffee Bean', email: 'cozybean@stores.com', address: '99 Espresso Ave, Coffee Quarter, Chicago, IL 60611', ownerId: owners[2].id },
    { name: 'Metro Clothing Outlet', email: 'metroclothing@stores.com', address: '77 Fashion Avenue, Garment District, Chicago, IL 60601', ownerId: owners[2].id },
    { name: 'Elite Books & Stationery', email: 'elitebooks@stores.com', address: '101 Library Way, Academic Square, Seattle, WA 98105', ownerId: owners[3].id },
    { name: 'Glow Cosmetics Boutique', email: 'glowbeauty@stores.com', address: '303 Glamour Boulevard, Vanity Center, Seattle, WA 98101', ownerId: owners[3].id },
  ];

  const stores: any[] = [];
  for (const s of storesData) {
    const store = await prisma.store.create({
      data: s,
    });
    stores.push(store);
  }

  // 5. Create Ratings/Reviews
  const ratingComments = [
    { value: 5, comment: 'Absolutely amazing! Highly recommend visiting this place.' },
    { value: 5, comment: 'Incredible customer support. The staff went above and beyond.' },
    { value: 4, comment: 'Great quality, but the parking spaces are quite limited.' },
    { value: 4, comment: 'Very pleasant experience. Will definitely visit again.' },
    { value: 3, comment: 'Average quality. Prices are a bit too high for what you get.' },
    { value: 3, comment: 'Decent, but customer service was a bit slow today.' },
    { value: 2, comment: 'Very disappointed with the service. Needs serious improvement.' },
    { value: 1, comment: 'Terrible experience. Quality was subpar and staff was extremely rude.' },
  ];

  // Distribute reviews deterministically to ensure unique constraints: (userId, storeId)
  // Each user leaves 3-4 ratings on different stores
  let ratingsCount = 0;
  const userRatingPairs = new Set<string>();

  for (let uIdx = 0; uIdx < users.length; uIdx++) {
    const user = users[uIdx];
    // Define which stores this user will rate (rotated list)
    const storesToRate = [
      stores[uIdx % stores.length],
      stores[(uIdx + 2) % stores.length],
      stores[(uIdx + 5) % stores.length],
    ];

    for (let sIdx = 0; sIdx < storesToRate.length; sIdx++) {
      const store = storesToRate[sIdx];
      const pairKey = `${user.id}_${store.id}`;
      
      if (!userRatingPairs.has(pairKey)) {
        // Pick a rating comment based on user and store index to get variety
        const commentIdx = (uIdx + sIdx) % ratingComments.length;
        const review = ratingComments[commentIdx];

        await prisma.rating.create({
          data: {
            value: review.value,
            comment: review.comment,
            userId: user.id,
            storeId: store.id,
          },
        });
        userRatingPairs.add(pairKey);
        ratingsCount++;
      }
    }
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Seeding Summary:`);
  console.log(`   - Admins: 1 (${admin.email})`);
  console.log(`   - Owners: ${owners.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Stores: ${stores.length}`);
  console.log(`   - Reviews: ${ratingsCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
