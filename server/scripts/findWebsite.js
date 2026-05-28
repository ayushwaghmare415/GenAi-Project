import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Website from '../model/website.model.js';

dotenv.config();

const id = process.argv[2];
if (!id) {
  console.error('Usage: node scripts/findWebsite.js <websiteId>');
  process.exit(1);
}

const url = process.env.MONGODB_URL;
if (!url) {
  console.error('MONGODB_URL not set in environment');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(url);
    const website = await Website.findById(id).lean();
    if (!website) {
      console.log('Website not found for id', id);
    } else {
      console.log('Website found:');
      console.log(JSON.stringify(website, null, 2));
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
