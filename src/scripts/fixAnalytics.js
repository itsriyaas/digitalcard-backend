import mongoose from 'mongoose';
import Catalogue from '../models/Catalogue.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixAnalytics = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Get all catalogues
    const catalogues = await Catalogue.find({});
    console.log(`Found ${catalogues.length} catalogues`);

    for (const catalogue of catalogues) {
      console.log(`\nProcessing catalogue: ${catalogue.title}`);

      // Initialize analytics if not present
      if (!catalogue.analytics) {
        catalogue.analytics = {
          visitors: 0,
          totalOrders: 0,
          totalRevenue: 0
        };
      } else {
        // Ensure all fields exist
        if (catalogue.analytics.totalOrders === undefined) {
          catalogue.analytics.totalOrders = 0;
        }
        if (catalogue.analytics.totalRevenue === undefined) {
          catalogue.analytics.totalRevenue = 0;
        }
        if (catalogue.analytics.visitors === undefined) {
          catalogue.analytics.visitors = 0;
        }
      }

      // Recalculate from orders
      const orders = await Order.find({
        catalogue: catalogue._id,
        paymentStatus: 'completed'
      });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      console.log(`  Orders found: ${totalOrders}`);
      console.log(`  Revenue calculated: ₹${totalRevenue}`);

      // Update analytics
      catalogue.analytics.totalOrders = totalOrders;
      catalogue.analytics.totalRevenue = totalRevenue;

      await catalogue.save();
      console.log(`  ✓ Updated analytics for ${catalogue.title}`);
    }

    console.log('\n✅ Analytics fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing analytics:', error);
    process.exit(1);
  }
};

fixAnalytics();
