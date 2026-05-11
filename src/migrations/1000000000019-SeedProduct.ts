// import { MigrationInterface, QueryRunner } from "typeorm";
// import { CategoryEnum } from "src/admin-product/enum/category.enum";
// import { ConditionEnum } from "src/admin-product/enum/condition.enum";
// import { StorageEnum } from "src/admin-product/enum/storage.enum";

// export class SeedProductData1712345678902 implements MigrationInterface {
//   name = "SeedProductData1712345678902";

//   public async up(queryRunner: QueryRunner): Promise<void> {
//     // Insert brands
//     await queryRunner.query(`
//             INSERT INTO "brand" ("title") VALUES 
//             ('Apple'),
//             ('Samsung'),
//             ('Google'),
//             ('OnePlus'),
//             ('Xiaomi')
//             ON CONFLICT DO NOTHING;
//         `);

//     // Insert colors
//     await queryRunner.query(`
//             INSERT INTO "color" ("title") VALUES 
//             ('Black'),
//             ('White'),
//             ('Silver'),
//             ('Gold'),
//             ('Blue'),
//             ('Red'),
//             ('Green'),
//             ('Purple')
//             ON CONFLICT DO NOTHING;
//         `);

//     // Insert models for different categories
//     await queryRunner.query(`
//             INSERT INTO "model" ("category", "title", "brandId") VALUES 
//             -- Apple models
//             ('${CategoryEnum.MOBILE}', 'iPhone 15 Pro', 1),
//             ('${CategoryEnum.MOBILE}', 'iPhone 14', 1),
//             ('${CategoryEnum.MOBILE}', 'iPhone 13', 1),
//             ('${CategoryEnum.TABLET}', 'iPad Pro', 1),
//             ('${CategoryEnum.TABLET}', 'iPad Air', 1),
//             ('${CategoryEnum.LAPTOP}', 'MacBook Pro', 1),
            
//             -- Samsung models
//             ('${CategoryEnum.MOBILE}', 'Galaxy S24', 2),
//             ('${CategoryEnum.MOBILE}', 'Galaxy S23 Ultra', 2),
//             ('${CategoryEnum.MOBILE}', 'Galaxy Z Fold5', 2),
//             ('${CategoryEnum.TABLET}', 'Galaxy Tab S9', 2),
            
//             -- Google models
//             ('${CategoryEnum.MOBILE}', 'Pixel 8 Pro', 3),
//             ('${CategoryEnum.MOBILE}', 'Pixel 7', 3),
            
//             -- OnePlus models
//             ('${CategoryEnum.MOBILE}', 'OnePlus 12', 4),
//             ('${CategoryEnum.MOBILE}', 'OnePlus 11', 4),
            
//             -- Xiaomi models
//             ('${CategoryEnum.MOBILE}', 'Xiaomi 14', 5),
//             ('${CategoryEnum.MOBILE}', 'Redmi Note 13', 5)
//             ON CONFLICT DO NOTHING;
//         `);

//     // Insert products
//     await queryRunner.query(`
//             INSERT INTO "product" (
//                 "category", "releaseDate", "name", "description", 
//                 "metaTitle", "metaDescription", "visibleOnStore", "recommended",
//                 "brandId", "modelId"
//             ) VALUES 
//             -- Apple products
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2023-09-22', 
//                 'iPhone 15 Pro 128GB', 
//                 'The most advanced iPhone with titanium design and A17 Pro chip.',
//                 'iPhone 15 Pro - Best .MOBILE', 
//                 'Buy iPhone 15 Pro with amazing features and performance',
//                 true, true, 1, 1
//             ),
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2022-09-16', 
//                 'iPhone 14 256GB', 
//                 'Experience the amazing iPhone 14 with advanced camera system.',
//                 'iPhone 14 - Premium .MOBILE', 
//                 'Get iPhone 14 with great discount offers',
//                 true, false, 1, 2
//             ),
//             (
//                 '${CategoryEnum.TABLET}', 
//                 '2023-05-15', 
//                 'iPad Pro M2', 
//                 'Powerful tablet with M2 chip for professional work.',
//                 'iPad Pro - Professional Tablet', 
//                 'iPad Pro with M2 chip for ultimate performance',
//                 true, true, 1, 4
//             ),
//             (
//                 '${CategoryEnum.LAPTOP}', 
//                 '2023-11-07', 
//                 'MacBook Pro 16"', 
//                 'Professional laptop with M3 Max chip for extreme performance.',
//                 'MacBook Pro - Professional Laptop', 
//                 'MacBook Pro for developers and creatives',
//                 true, true, 1, 6
//             ),

//             -- Samsung products
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2024-01-17', 
//                 'Samsung Galaxy S24 Ultra', 
//                 'Flagship .MOBILE with AI features and S Pen.',
//                 'Galaxy S24 Ultra - AI Phone', 
//                 'Experience AI-powered .MOBILE with Galaxy S24',
//                 true, true, 2, 7
//             ),
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2023-02-17', 
//                 'Samsung Galaxy S23 Ultra', 
//                 'Previous flagship with excellent camera and performance.',
//                 'Galaxy S23 Ultra - Camera King', 
//                 'Galaxy S23 Ultra with 200MP camera',
//                 true, false, 2, 8
//             ),
//             (
//                 '${CategoryEnum.TABLET}', 
//                 '2023-08-11', 
//                 'Samsung Galaxy Tab S9+', 
//                 'Premium Android tablet with S Pen included.',
//                 'Galaxy Tab S9 - Best Android Tablet', 
//                 'Samsung tablet for productivity and entertainment',
//                 true, true, 2, 10
//             ),

//             -- Google products
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2023-10-04', 
//                 'Google Pixel 8 Pro', 
//                 'Google flagship with Tensor G3 and advanced AI features.',
//                 'Pixel 8 Pro - Google .MOBILE', 
//                 'Pixel 8 Pro with best-in-class camera',
//                 true, true, 3, 11
//             ),
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2022-10-13', 
//                 'Google Pixel 7', 
//                 'Amazing value .MOBILE with Google AI capabilities.',
//                 'Pixel 7 - Value Flagship', 
//                 'Pixel 7 with great price to performance ratio',
//                 true, false, 3, 12
//             ),

//             -- OnePlus products
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2024-01-23', 
//                 'OnePlus 12 5G', 
//                 'Flagship killer with Hasselblad camera and fast charging.',
//                 'OnePlus 12 - Never Settle', 
//                 'OnePlus 12 with latest Snapdragon processor',
//                 true, true, 4, 13
//             ),

//             -- Xiaomi products
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2023-12-01', 
//                 'Xiaomi 14 Pro', 
//                 'Flagship .MOBILE with Leica camera partnership.',
//                 'Xiaomi 14 Pro - Leica Camera', 
//                 'Xiaomi 14 with professional Leica optics',
//                 true, false, 5, 15
//             ),
//             (
//                 '${CategoryEnum.MOBILE}', 
//                 '2024-01-15', 
//                 'Redmi Note 13 Pro+', 
//                 'Mid-range champion with 120W fast charging.',
//                 'Redmi Note 13 - Best Budget', 
//                 'Redmi Note 13 with amazing features at low price',
//                 true, true, 5, 16
//             )
//             ON CONFLICT DO NOTHING;
//         `);

//     // Insert product variants with different conditions, storage, and prices
//     // This covers all filter ranges for testing
//     await this.insertProductVariants(queryRunner);

//     // Insert product images
//     await this.insertProductImages(queryRunner);

//     // Insert product tags
//     await this.insertProductTags(queryRunner);

//     // Insert product specifications
//     await this.insertProductSpecifications(queryRunner);
//   }

//   private async insertProductVariants(queryRunner: QueryRunner): Promise<void> {
//     const variants = [
//       // iPhone 15 Pro variants - covers high price range
//       {
//         productId: 1,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Black",
//         SKU: "IP15P128BKNEW",
//         quantity: 15,
//         basePrice: 999.0,
//         discount: 0,
//         brandNewPrice: 999.0,
//       },
//       {
//         productId: 1,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "White",
//         SKU: "IP15P256WHNEW",
//         quantity: 10,
//         basePrice: 1099.0,
//         discount: 5,
//         brandNewPrice: 1099.0,
//       },
//       {
//         productId: 1,
//         storage: StorageEnum.GB_512,
//         condition: ConditionEnum.GOOD,
//         color: "Gold",
//         SKU: "IP15P512GDREF",
//         quantity: 5,
//         basePrice: 899.0,
//         discount: 10,
//         brandNewPrice: 1199.0,
//       },
//       {
//         productId: 1,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.FAIR,
//         color: "Blue",
//         SKU: "IP15P128BLUSE",
//         quantity: 3,
//         basePrice: 749.0,
//         discount: 15,
//         brandNewPrice: 999.0,
//       },

//       // iPhone 14 variants - covers medium price range with discounts
//       {
//         productId: 2,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Purple",
//         SKU: "IP14256PLNEW",
//         quantity: 20,
//         basePrice: 799.0,
//         discount: 10,
//         brandNewPrice: 799.0,
//       },
//       {
//         productId: 2,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.GOOD,
//         color: "Black",
//         SKU: "IP14128BKREF",
//         quantity: 8,
//         basePrice: 599.0,
//         discount: 20,
//         brandNewPrice: 699.0,
//       },
//       {
//         productId: 2,
//         storage: StorageEnum.GB_512,
//         condition: ConditionEnum.FAIR,
//         color: "Red",
//         SKU: "IP14512RDUSE",
//         quantity: 2,
//         basePrice: 499.0,
//         discount: 25,
//         brandNewPrice: 899.0,
//       },

//       // Galaxy S24 Ultra variants - covers high price range
//       {
//         productId: 5,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Black",
//         SKU: "GS24U256BKNEW",
//         quantity: 12,
//         basePrice: 1199.0,
//         discount: 0,
//         brandNewPrice: 1199.0,
//       },
//       {
//         productId: 5,
//         storage: StorageEnum.GB_512,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Gray",
//         SKU: "GS24U512GYNEW",
//         quantity: 8,
//         basePrice: 1299.0,
//         discount: 5,
//         brandNewPrice: 1299.0,
//       },
//       {
//         productId: 5,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.GOOD,
//         color: "Green",
//         SKU: "GS24U256GNREF",
//         quantity: 4,
//         basePrice: 999.0,
//         discount: 15,
//         brandNewPrice: 1199.0,
//       },

//       // Galaxy S23 Ultra variants - covers discount testing
//       {
//         productId: 6,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Black",
//         SKU: "GS23U256BKNEW",
//         quantity: 6,
//         basePrice: 899.0,
//         discount: 30,
//         brandNewPrice: 1199.0,
//       },
//       {
//         productId: 6,
//         storage: StorageEnum.GB_512,
//         condition: ConditionEnum.GOOD,
//         color: "White",
//         SKU: "GS23U512WHREF",
//         quantity: 3,
//         basePrice: 799.0,
//         discount: 35,
//         brandNewPrice: 1299.0,
//       },

//       // Pixel 8 Pro variants - covers medium-high price range
//       {
//         productId: 8,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Black",
//         SKU: "P8P128BKNEW",
//         quantity: 10,
//         basePrice: 899.0,
//         discount: 0,
//         brandNewPrice: 899.0,
//       },
//       {
//         productId: 8,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Blue",
//         SKU: "P8P256BLNEW",
//         quantity: 7,
//         basePrice: 999.0,
//         discount: 8,
//         brandNewPrice: 999.0,
//       },
//       {
//         productId: 8,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.FAIR,
//         color: "White",
//         SKU: "P8P128WHREF",
//         quantity: 5,
//         basePrice: 699.0,
//         discount: 22,
//         brandNewPrice: 899.0,
//       },

//       // Pixel 7 variants - covers low price range
//       {
//         productId: 9,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.GOOD,
//         color: "Black",
//         SKU: "P7128BKNEW",
//         quantity: 15,
//         basePrice: 499.0,
//         discount: 15,
//         brandNewPrice: 599.0,
//       },
//       {
//         productId: 9,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.VERY_GOOD,
//         color: "Green",
//         SKU: "P7256GNREF",
//         quantity: 8,
//         basePrice: 399.0,
//         discount: 25,
//         brandNewPrice: 699.0,
//       },

//       // OnePlus 12 variants - covers medium price range
//       {
//         productId: 10,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Black",
//         SKU: "OP12256BKNEW",
//         quantity: 12,
//         basePrice: 799.0,
//         discount: 0,
//         brandNewPrice: 799.0,
//       },
//       {
//         productId: 10,
//         storage: StorageEnum.GB_512,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Green",
//         SKU: "OP12512GNNEW",
//         quantity: 6,
//         basePrice: 899.0,
//         discount: 5,
//         brandNewPrice: 899.0,
//       },

//       // Xiaomi 14 Pro variants
//       {
//         productId: 11,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Black",
//         SKU: "XM14P256BKNEW",
//         quantity: 8,
//         basePrice: 899.0,
//         discount: 10,
//         brandNewPrice: 999.0,
//       },
//       {
//         productId: 11,
//         storage: StorageEnum.GB_512,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "White",
//         SKU: "XM14P512WHNEW",
//         quantity: 4,
//         basePrice: 999.0,
//         discount: 12,
//         brandNewPrice: 1199.0,
//       },

//       // Redmi Note 13 variants - covers low price range
//       {
//         productId: 12,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Blue",
//         SKU: "RMN13128BLNEW",
//         quantity: 25,
//         basePrice: 299.0,
//         discount: 0,
//         brandNewPrice: 299.0,
//       },
//       {
//         productId: 12,
//         storage: StorageEnum.GB_256,
//         condition: ConditionEnum.LIKE_NEW,
//         color: "Black",
//         SKU: "RMN13256BKNEW",
//         quantity: 15,
//         basePrice: 349.0,
//         discount: 8,
//         brandNewPrice: 349.0,
//       },
//       {
//         productId: 12,
//         storage: StorageEnum.GB_128,
//         condition: ConditionEnum.VERY_GOOD,
//         color: "Purple",
//         SKU: "RMN13128PLREF",
//         quantity: 10,
//         basePrice: 249.0,
//         discount: 17,
//         brandNewPrice: 299.0,
//       },
//     ];

//     for (const variant of variants) {
//       await queryRunner.query(`
//                 INSERT INTO "product_variant" (
//                     "productId", "storage", "condition", "color", "SKU", 
//                     "quantity", "basePrice", "discount", "brandNewPrice",
//                     "hasChargingCable", "hasAdapter", "primary"
//                 ) VALUES (
//                     ${variant.productId}, 
//                     '${variant.storage}', 
//                     '${variant.condition}', 
//                     '${variant.color}', 
//                     '${variant.SKU}', 
//                     ${variant.quantity}, 
//                     ${variant.basePrice}, 
//                     ${variant.discount}, 
//                     ${variant.brandNewPrice},
//                     ${Math.random() > 0.3}, 
//                     ${Math.random() > 0.5}, 
//                     ${variant.SKU.includes("NEW") && variant.condition === ConditionEnum.LIKE_NEW}
//                 ) ON CONFLICT DO NOTHING;
//             `);
//     }
//   }

//   private async insertProductImages(queryRunner: QueryRunner): Promise<void> {
//     const images = [];

//     for (let productId = 1; productId <= 12; productId++) {
//       for (let i = 1; i <= 4; i++) {
//         images.push({
//           productId,
//           filePath: `/images/products/${productId}/image-${i}.jpg`,
//           index: i,
//         });
//       }
//     }

//     for (const image of images) {
//       await queryRunner.query(`
//                 INSERT INTO "product_image" ("productId", "filePath", "index") 
//                 VALUES (${image.productId}, '${image.filePath}', ${image.index})
//                 ON CONFLICT DO NOTHING;
//             `);
//     }
//   }

//   private async insertProductTags(queryRunner: QueryRunner): Promise<void> {
//     const tags = [
//       { productId: 1, value: "flagship" },
//       { productId: 1, value: "premium" },
//       { productId: 1, value: "5g" },
//       { productId: 1, value: "titanium" },
//       { productId: 2, value: "affordable" },
//       { productId: 2, value: "camera" },
//       { productId: 2, value: "5g" },
//       { productId: 3, value: "tablet" },
//       { productId: 3, value: "professional" },
//       { productId: 3, value: "m2" },
//       { productId: 4, value: "laptop" },
//       { productId: 4, value: "professional" },
//       { productId: 4, value: "m3" },
//       { productId: 5, value: "ai" },
//       { productId: 5, value: "flagship" },
//       { productId: 5, value: "s-pen" },
//       { productId: 6, value: "camera" },
//       { productId: 6, value: "200mp" },
//       { productId: 7, value: "tablet" },
//       { productId: 7, value: "android" },
//       { productId: 8, value: "google" },
//       { productId: 8, value: "ai" },
//       { productId: 8, value: "camera" },
//       { productId: 9, value: "value" },
//       { productId: 9, value: "google" },
//       { productId: 10, value: "fast-charging" },
//       { productId: 10, value: "hasselblad" },
//       { productId: 11, value: "leica" },
//       { productId: 11, value: "camera" },
//       { productId: 12, value: "budget" },
//       { productId: 12, value: "fast-charging" },
//       { productId: 12, value: "value" },
//     ];

//     for (const tag of tags) {
//       await queryRunner.query(`
//                 INSERT INTO "product_tag" ("productId", "value") 
//                 VALUES (${tag.productId}, '${tag.value}')
//                 ON CONFLICT DO NOTHING;
//             `);
//     }
//   }

//   private async insertProductSpecifications(queryRunner: QueryRunner): Promise<void> {
//     // Insert product specifications
//     await queryRunner.query(`
//             INSERT INTO "product_specification" ("title", "productId") VALUES 
//             ('Display', 1), ('Processor', 1), ('Camera', 1), ('Battery', 1),
//             ('Display', 2), ('Processor', 2), ('Camera', 2), ('Battery', 2),
//             ('Display', 5), ('Processor', 5), ('Camera', 5), ('Battery', 5),
//             ('Display', 8), ('Processor', 8), ('Camera', 8), ('Battery', 8),
//             ('Display', 10), ('Processor', 10), ('Camera', 10), ('Battery', 10)
//             ON CONFLICT DO NOTHING;
//         `);

//     // Insert specification attributes
//     await queryRunner.query(`
//             INSERT INTO "specification_attribute" ("title", "value", "productSpecificationId") VALUES 
//             -- iPhone 15 Pro specs
//             ('Size', '6.1 inches', 1), ('Technology', 'Super Retina XDR', 1), ('Resolution', '2556x1179', 1),
//             ('Chip', 'A17 Pro', 2), ('Cores', '6-core', 2),
//             ('Main Camera', '48MP', 3), ('Telephoto', '12MP', 3), ('Ultra Wide', '12MP', 3),
//             ('Capacity', '3274 mAh', 4), ('Fast Charging', 'Yes', 4),
            
//             -- Galaxy S24 Ultra specs
//             ('Size', '6.8 inches', 9), ('Technology', 'Dynamic AMOLED 2X', 9), ('Refresh Rate', '120Hz', 9),
//             ('Chip', 'Snapdragon 8 Gen 3', 10), ('RAM', '12GB', 10),
//             ('Main Camera', '200MP', 11), ('Telephoto', '50MP', 11), ('Ultra Wide', '12MP', 11),
//             ('Capacity', '5000 mAh', 12), ('Fast Charging', '45W', 12),
            
//             -- Pixel 8 Pro specs
//             ('Size', '6.7 inches', 13), ('Technology', 'LTPO OLED', 13), ('Refresh Rate', '120Hz', 13),
//             ('Chip', 'Tensor G3', 14), ('RAM', '12GB', 14),
//             ('Main Camera', '50MP', 15), ('Ultra Wide', '48MP', 15), ('Telephoto', '48MP', 15),
//             ('Capacity', '5050 mAh', 16), ('Fast Charging', '30W', 16),
            
//             -- OnePlus 12 specs
//             ('Size', '6.82 inches', 17), ('Technology', 'LTPO AMOLED', 17), ('Refresh Rate', '120Hz', 17),
//             ('Chip', 'Snapdragon 8 Gen 3', 18), ('RAM', '16GB', 18),
//             ('Main Camera', '50MP', 19), ('Ultra Wide', '48MP', 19), ('Telephoto', '64MP', 19),
//             ('Capacity', '5400 mAh', 20), ('Fast Charging', '100W', 20)
//             ON CONFLICT DO NOTHING;
//         `);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     // Delete in reverse order to maintain foreign key constraints
//     await queryRunner.query(`DELETE FROM "specification_attribute"`);
//     await queryRunner.query(`DELETE FROM "product_specification"`);
//     await queryRunner.query(`DELETE FROM "product_tag"`);
//     await queryRunner.query(`DELETE FROM "product_image"`);
//     await queryRunner.query(`DELETE FROM "product_variant"`);
//     await queryRunner.query(`DELETE FROM "product"`);
//     await queryRunner.query(`DELETE FROM "model"`);
//     await queryRunner.query(`DELETE FROM "color"`);
//     await queryRunner.query(`DELETE FROM "brand"`);
//   }
// }
