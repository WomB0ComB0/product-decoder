import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function deleteAllData() {
  await prisma.userChoice.deleteMany(),
    await prisma.outputInfo.deleteMany(),
    await prisma.expandedFKRelation.deleteMany(),
    await prisma.userTopResult.deleteMany(),
    await prisma.searchResult.deleteMany(),
    await prisma.locationPricingLayer.deleteMany(),
    await prisma.pricing.deleteMany(),
    await prisma.location.deleteMany(),
    await prisma.foodPipelineDetails.deleteMany(),
    await prisma.clothesPipelineDetails.deleteMany(),
    await prisma.drugsPipelineDetails.deleteMany(),
    await prisma.technologyPipelineDetails.deleteMany(),
    await prisma.foodPipeline.deleteMany(),
    await prisma.clothesPipeline.deleteMany(),
    await prisma.drugsPipeline.deleteMany(),
    await prisma.technologyPipeline.deleteMany(),
    await prisma.primitiveCategory.deleteMany(),
    await prisma.nonPrimitiveCategory.deleteMany(),
    await prisma.productCategory.deleteMany(),
    await prisma.uUIDRelation.deleteMany(),
    await prisma.metadata.deleteMany(),
    await prisma.topResult.deleteMany(),
    await prisma.imageProcess.deleteMany(),
    await prisma.address.deleteMany(),
    await prisma.profile.deleteMany(),
    await prisma.twoFactorConfirmation.deleteMany(),
    await prisma.twoFactorToken.deleteMany(),
    await prisma.passwordResetToken.deleteMany(),
    await prisma.verificationToken.deleteMany(),
    await prisma.session.deleteMany(),
    await prisma.account.deleteMany(),
    await prisma.aPIIntegration.deleteMany(),
    await prisma.user.deleteMany();
}

async function main(): Promise<void> {
  console.log('Starting seed...');

  await deleteAllData();

  // Create API Integrations
  const googleMapsAPI = await prisma.aPIIntegration.create({
    data: {
      type: 'Google Maps',
      details: JSON.stringify({
        apiKey: 'mock_google_maps_key',
        endpoint: 'https://maps.googleapis.com/maps/api',
        features: ['places', 'geocoding', 'directions'],
      }),
    },
  });

  const youtubeAPI = await prisma.aPIIntegration.create({
    data: {
      type: 'YouTube',
      details: JSON.stringify({
        apiKey: 'mock_youtube_key',
        endpoint: 'https://www.googleapis.com/youtube/v3',
        features: ['search', 'videos', 'channels'],
      }),
    },
  });

  const customSearchAPI = await prisma.aPIIntegration.create({
    data: {
      type: 'Custom Search',
      details: JSON.stringify({
        apiKey: 'mock_search_key',
        endpoint: 'https://customsearch.googleapis.com/customsearch/v1',
        searchEngineId: 'mock_engine_id',
      }),
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
      password: hashedPassword,
      role: 'MEMBER',
      isTwoFactorEnabled: false,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      emailVerified: true,
      password: hashedPassword,
      role: 'MEMBER',
      isTwoFactorEnabled: true,
    },
  });

  const guestUser = await prisma.user.create({
    data: {
      name: 'Guest User',
      email: 'guest@example.com',
      emailVerified: false,
      role: 'GUEST',
      isTwoFactorEnabled: false,
    },
  });

  // Create Profiles with Addresses
  await prisma.profile.create({
    data: {
      userId: user1.id,
      role: 'MEMBER',
      active: true,
      version: '1.0',
      photoUrl: 'https://example.com/photos/john.jpg',
      address: {
        create: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          province: 'NY',
          country: 'USA',
          zip: '10001',
        },
      },
    },
  });

  await prisma.profile.create({
    data: {
      userId: user2.id,
      role: 'MEMBER',
      active: true,
      version: '1.1',
      photoUrl: 'https://example.com/photos/jane.jpg',
      address: {
        create: {
          line1: '456 Oak Ave',
          city: 'Los Angeles',
          province: 'CA',
          country: 'USA',
          zip: '90210',
        },
      },
    },
  });

  // Create Two Factor Confirmation for user2
  await prisma.twoFactorConfirmation.create({
    data: {
      userId: user2.id,
    },
  });

  // Create Sessions
  await prisma.session.create({
    data: {
      sessionToken: 'session_token_1',
      userId: user1.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000), // 30 days from now
    },
  });

  // Create Verification and Reset Tokens
  await prisma.verificationToken.create({
    data: {
      email: 'newuser@example.com',
      token: 'verification_token_123',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1_000), // 24 hours from now
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      email: user1.email!,
      token: 'reset_token_456',
      expires: new Date(Date.now() + 2 * 60 * 60 * 1_000), // 2 hours from now
    },
  });

  await prisma.twoFactorToken.create({
    data: {
      email: user2.email!,
      token: '123456',
      expires: new Date(Date.now() + 5 * 60 * 1_000), // 5 minutes from now
    },
  });

  // Create Image Processes
  const imageProcess1 = await prisma.imageProcess.create({
    data: {
      userId: user1.id,
      imageUrl: 'https://example.com/images/food-image-1.jpg',
      processedAt: new Date(),
    },
  });

  const imageProcess2 = await prisma.imageProcess.create({
    data: {
      userId: user2.id,
      imageUrl: 'https://example.com/images/tech-image-1.jpg',
      processedAt: new Date(),
    },
  });

  // Create Top Results
  const topResult1 = await prisma.topResult.create({
    data: {
      imageProcessId: imageProcess1.id,
      resultData: JSON.stringify({
        category: 'food',
        confidence: 0.95,
        items: ['apple', 'banana', 'orange'],
      }),
      createdAt: new Date(),
    },
  });

  const topResult2 = await prisma.topResult.create({
    data: {
      imageProcessId: imageProcess2.id,
      resultData: JSON.stringify({
        category: 'technology',
        confidence: 0.88,
        items: ['smartphone', 'laptop', 'headphones'],
      }),
      createdAt: new Date(),
    },
  });

  // Create Metadata
  const metadata1 = await prisma.metadata.create({
    data: {
      topResultId: topResult1.id,
      data: JSON.stringify({
        extractedFeatures: ['color', 'shape', 'texture'],
        processingTime: 1.5,
        algorithm: 'CNN-v2',
      }),
      createdAt: new Date(),
    },
  });

  const metadata2 = await prisma.metadata.create({
    data: {
      topResultId: topResult2.id,
      data: JSON.stringify({
        extractedFeatures: ['brand', 'model', 'color'],
        processingTime: 2.1,
        algorithm: 'ResNet-50',
      }),
      createdAt: new Date(),
    },
  });

  // Create UUID Relations
  await prisma.uUIDRelation.create({
    data: {
      metadataId: metadata1.id,
      foreignKey: 'food_category_uuid_123',
      createdAt: new Date(),
    },
  });

  await prisma.uUIDRelation.create({
    data: {
      metadataId: metadata2.id,
      foreignKey: 'tech_category_uuid_456',
      createdAt: new Date(),
    },
  });

  // Create Product Categories
  const foodCategory = await prisma.productCategory.create({
    data: {
      metadataId: metadata1.id,
      categoryType: 'food',
      name: 'Fresh Fruits',
      createdAt: new Date(),
    },
  });

  const techCategory = await prisma.productCategory.create({
    data: {
      metadataId: metadata2.id,
      categoryType: 'technology',
      name: 'Consumer Electronics',
      createdAt: new Date(),
    },
  });

  // Create Primitive Categories
  const primitiveFoodCategory = await prisma.primitiveCategory.create({
    data: {
      productCategoryId: foodCategory.id,
      name: 'Citrus Fruits',
      apiIntegrationId: googleMapsAPI.id,
    },
  });

  const primitiveTechCategory = await prisma.primitiveCategory.create({
    data: {
      productCategoryId: techCategory.id,
      name: 'Mobile Devices',
      apiIntegrationId: youtubeAPI.id,
    },
  });

  // Create Non-Primitive Categories
  const nonPrimitiveFoodCategory = await prisma.nonPrimitiveCategory.create({
    data: {
      productCategoryId: foodCategory.id,
      name: 'Organic Produce',
      apiIntegrationId: customSearchAPI.id,
    },
  });

  // Create Food Pipeline
  const foodPipeline = await prisma.foodPipeline.create({
    data: {
      productCategoryId: foodCategory.id,
      apiIntegrationId: googleMapsAPI.id,
    },
  });

  // Create Technology Pipeline
  const techPipeline = await prisma.technologyPipeline.create({
    data: {
      productCategoryId: techCategory.id,
      apiIntegrationId: youtubeAPI.id,
    },
  });

  // Create Clothes Pipeline
  const clothesCategory = await prisma.productCategory.create({
    data: {
      metadataId: metadata1.id,
      categoryType: 'clothes',
      name: 'Casual Wear',
      createdAt: new Date(),
    },
  });

  const clothesPipeline = await prisma.clothesPipeline.create({
    data: {
      productCategoryId: clothesCategory.id,
      apiIntegrationId: customSearchAPI.id,
    },
  });

  // Create Drugs Pipeline
  const drugsCategory = await prisma.productCategory.create({
    data: {
      metadataId: metadata2.id,
      categoryType: 'drugs',
      name: 'Over-the-Counter',
      createdAt: new Date(),
    },
  });

  const drugsPipeline = await prisma.drugsPipeline.create({
    data: {
      productCategoryId: drugsCategory.id,
    },
  });

  // Create Pipeline Details
  await prisma.foodPipelineDetails.create({
    data: {
      foodPipelineId: foodPipeline.id,
      nearestLocation: 'Whole Foods Market - 0.5 miles',
      nutrientInfo: JSON.stringify({
        calories: 95,
        fiber: '4g',
        vitaminC: '14% DV',
        sugar: '19g',
      }),
      priceChangeHistory: JSON.stringify([
        { date: '2024-01-01', price: 1.99 },
        { date: '2024-01-15', price: 2.29 },
        { date: '2024-02-01', price: 1.89 },
      ]),
    },
  });

  await prisma.clothesPipelineDetails.create({
    data: {
      clothesPipelineId: clothesPipeline.id,
      nearestLocation: 'Target - 1.2 miles',
      productReviews: JSON.stringify([
        { rating: 4.5, review: 'Great quality for the price' },
        { rating: 4.0, review: 'Comfortable fit, nice material' },
      ]),
      priceChangeHistory: JSON.stringify([
        { date: '2024-01-01', price: 29.99 },
        { date: '2024-01-20', price: 24.99 },
        { date: '2024-02-01', price: 27.99 },
      ]),
    },
  });

  await prisma.drugsPipelineDetails.create({
    data: {
      drugsPipelineId: drugsPipeline.id,
      nearestLocation: 'CVS Pharmacy - 0.8 miles',
      priceChangeHistory: JSON.stringify([
        { date: '2024-01-01', price: 8.99 },
        { date: '2024-01-15', price: 7.49 },
        { date: '2024-02-01', price: 8.29 },
      ]),
    },
  });

  await prisma.technologyPipelineDetails.create({
    data: {
      technologyPipelineId: techPipeline.id,
      designatedTask: 'Price comparison and feature analysis for consumer electronics',
    },
  });

  // Create Location Pricing Layers
  await prisma.locationPricingLayer.create({
    data: {
      pipelineType: 'food',
      foodPipelineId: foodPipeline.id,
      createdAt: new Date(),
    },
  });

  await prisma.locationPricingLayer.create({
    data: {
      pipelineType: 'technology',
      technologyPipelineId: techPipeline.id,
      createdAt: new Date(),
    },
  });

  // Create Search Results
  const searchResult1 = await prisma.searchResult.create({
    data: {
      pipelineId: foodPipeline.id,
      expandedData: JSON.stringify({
        products: [
          { name: 'Organic Apples', price: 3.99, store: 'Whole Foods' },
          { name: 'Red Delicious Apples', price: 2.49, store: 'Safeway' },
        ],
        totalResults: 15,
        searchQuery: 'fresh apples near me',
      }),
      createdAt: new Date(),
    },
  });

  const searchResult2 = await prisma.searchResult.create({
    data: {
      pipelineId: techPipeline.id,
      expandedData: JSON.stringify({
        products: [
          { name: 'iPhone 15', price: 799, store: 'Apple Store' },
          { name: 'Samsung Galaxy S24', price: 699, store: 'Best Buy' },
        ],
        totalResults: 8,
        searchQuery: 'smartphones comparison',
      }),
      createdAt: new Date(),
    },
  });

  // Create Expanded FK Relations
  await prisma.expandedFKRelation.create({
    data: {
      searchResultId: searchResult1.id,
      foreignKey: 'food_store_relation_123',
      createdAt: new Date(),
    },
  });

  await prisma.expandedFKRelation.create({
    data: {
      searchResultId: searchResult2.id,
      foreignKey: 'tech_store_relation_456',
      createdAt: new Date(),
    },
  });

  // Create Output Infos
  await prisma.outputInfo.create({
    data: {
      searchResultId: searchResult1.id,
      info: 'Found 15 nearby stores selling fresh fruits with competitive pricing',
      createdAt: new Date(),
    },
  });

  await prisma.outputInfo.create({
    data: {
      searchResultId: searchResult2.id,
      info: 'Compared 8 smartphone models across 5 different retailers',
      createdAt: new Date(),
    },
  });

  // Create Locations
  await prisma.location.create({
    data: {
      pipelineId: foodPipeline.id,
      nearestLocation: 'Whole Foods Market, 1234 Main St, New York, NY 10001',
      createdAt: new Date(),
    },
  });

  await prisma.location.create({
    data: {
      pipelineId: techPipeline.id,
      nearestLocation: 'Best Buy, 5678 Tech Ave, New York, NY 10002',
      createdAt: new Date(),
    },
  });

  // Create Pricings
  await prisma.pricing.create({
    data: {
      pipelineId: foodPipeline.id,
      priceChangeHistory: JSON.stringify({
        product: 'Organic Apples',
        history: [
          { date: '2024-01-01', price: 3.99 },
          { date: '2024-01-15', price: 4.29 },
          { date: '2024-02-01', price: 3.79 },
        ],
      }),
      createdAt: new Date(),
    },
  });

  await prisma.pricing.create({
    data: {
      pipelineId: techPipeline.id,
      priceChangeHistory: JSON.stringify({
        product: 'iPhone 15',
        history: [
          { date: '2024-01-01', price: 799 },
          { date: '2024-01-15', price: 749 },
          { date: '2024-02-01', price: 799 },
        ],
      }),
      createdAt: new Date(),
    },
  });

  // Create User Top Results
  await prisma.userTopResult.create({
    data: {
      userId: user1.id,
      topResultId: topResult1.id,
      selectedAt: new Date(),
    },
  });

  await prisma.userTopResult.create({
    data: {
      userId: user2.id,
      topResultId: topResult2.id,
      selectedAt: new Date(),
    },
  });

  // Create User Choices
  await prisma.userChoice.create({
    data: {
      userId: user1.id,
      topResultId: topResult1.id,
      selectedAt: new Date(),
    },
  });

  await prisma.userChoice.create({
    data: {
      userId: user2.id,
      topResultId: topResult2.id,
      selectedAt: new Date(),
    },
  });

  console.log('Seed completed successfully!');
  console.log({
    users: 3,
    profiles: 2,
    imageProcesses: 2,
    topResults: 2,
    productCategories: 4,
    pipelines: 4,
    apiIntegrations: 3,
  });
}

// create flags to make this more seamless if you want :D
// deleteAllData | main
deleteAllData()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
