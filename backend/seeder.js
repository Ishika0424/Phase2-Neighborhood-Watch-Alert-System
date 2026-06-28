require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resource = require('./models/Resource');
const Skill = require('./models/Skill');
const Alert = require('./models/Alert');

// Define users to seed/ensure exist
const additionalUsersData = [
  {
    name: 'Monix',
    email: 'mooni123@gmail.com',
    password: 'password123',
    phone: '555-0101',
    address: '456 Oak Street',
    locationName: 'Oak Street'
  },
  {
    name: 'Bobby',
    email: 'bob567@gmail.com',
    password: 'pass123',
    phone: '555-0102',
    address: '789 Maple Avenue',
    locationName: 'Maple Avenue'
  },
  {
    name: 'Alina Deshmukh',
    email: 'alina123@gmail.com',
    password: 'passing123',
    phone: '555-0103',
    address: '321 Pine Road',
    locationName: 'Pine Road'
  }
];

const seedData = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing Resource, Skill, and Alert data
    await Resource.deleteMany({});
    await Skill.deleteMany({});
    await Alert.deleteMany({});
    console.log('Cleared existing resources, skills, and alerts...');

    // Ensure main tester/existing user exists
    let mainUser = await User.findOne({ email: 'ishika.garg123@gmail.com' });
    
    if (!mainUser) {
      console.log('No existing user found. Creating primary tester user...');
      mainUser = await User.create({
        name: 'Ishika Garg',
        email: 'ishika.garg123@gmail.com',
        password: 'password123',
        phone: '555-0199',
        address: '123 Greenwood Lane',
        locationName: 'Greenwood'
      });
      console.log(`Created primary user: ${mainUser.email} (Password: password123)`);
    } else {
      mainUser.password = 'password123'; // Reset password to password123 so it's always testable
      await mainUser.save();
      console.log(`Using and updating primary user: ${mainUser.email} (Password set to: password123)`);
    }

    // Delete any stale users that are not in our list
    const allowedEmails = ['ishika.garg123@gmail.com', ...additionalUsersData.map(u => u.email)];
    const deleteResult = await User.deleteMany({ email: { $nin: allowedEmails } });
    if (deleteResult.deletedCount > 0) {
      console.log(`Cleaned up ${deleteResult.deletedCount} old/stale users from database.`);
    }

    // Ensure the 3 additional users exist
    const users = {
      primary: mainUser
    };

    for (const userData of additionalUsersData) {
      let u = await User.findOne({ email: userData.email });
      if (!u) {
        u = await User.create(userData);
        console.log(`Created user: ${userData.email} (Password: ${userData.password})`);
      } else {
        u.name = userData.name;
        u.password = userData.password; // This triggers the pre-save bcrypt hash
        u.phone = userData.phone;
        u.address = userData.address;
        u.locationName = userData.locationName;
        await u.save();
        console.log(`Updated user: ${userData.email} (Password updated to: ${userData.password})`);
      }
      users[userData.email] = u;
    }

    // Define items distributed among different owners
    const resources = [
      {
        owner: users['bob567@gmail.com']._id,
        name: 'Heavy Duty Lawnmower',
        description: 'Gas-powered lawnmower, perfect for medium to large lawns. Easy to start.',
        category: 'Tools',
        location: 'Maple Avenue',
        availabilityStatus: 'Available'
      },
      {
        owner: users['mooni123@gmail.com']._id,
        name: 'DeWalt Cordless Drill Set',
        description: '20V Max cordless drill with various bits and two rechargeable batteries.',
        category: 'Tools',
        location: 'Oak Street',
        availabilityStatus: 'Available'
      },
      {
        owner: users.primary._id,
        name: 'Cracking the Coding Interview',
        description: '189 Programming Questions and Solutions. Great for software engineering interview prep.',
        category: 'Books',
        location: 'Greenwood Lane',
        availabilityStatus: 'Available'
      },
      {
        owner: users['alina123@gmail.com']._id,
        name: 'Arduino Starter Kit',
        description: 'Includes Arduino Uno board, breadboard, wires, LEDs, resistors, and basic sensors for prototyping.',
        category: 'Electronics',
        location: 'Pine Road',
        availabilityStatus: 'Available'
      }
    ];

    const skills = [
      {
        owner: users.primary._id,
        title: 'Web Development Mentorship',
        description: 'Helping beginners learn HTML, CSS, JavaScript, and React. Happy to review code and resume.',
        category: 'Mentorship',
        availability: 'Evenings and weekends'
      },
      {
        owner: users['bob567@gmail.com']._id,
        title: 'Leaky Faucet & Plumbing Assist',
        description: 'Can help fix minor kitchen/bathroom plumbing leaks, install faucets, or replace pipe valves.',
        category: 'Home Maintenance',
        availability: 'Saturday mornings'
      },
      {
        owner: users['mooni123@gmail.com']._id,
        title: 'Calculus & Algebra Tutoring',
        description: 'Experienced college student offering tutoring for middle school and high school math subjects.',
        category: 'Tutoring',
        availability: 'Weekdays after 5 PM'
      },
      {
        owner: users['alina123@gmail.com']._id,
        title: 'WiFi & Router Setup Help',
        description: 'Troubleshooting home internet connection, setting up secure WiFi, or configuring smart home hubs.',
        category: 'Technical Support',
        availability: 'Flexible, contact to schedule'
      }
    ];

    // Define safety alerts for Phase 2
    const alerts = [
      {
        reporter: users['mooni123@gmail.com']._id,
        title: 'Suspicious Activity Near Oak Street Park',
        description: 'An unidentified individual was seen checking car door handles and looking into residential driveways near the main park entrance.',
        category: 'Suspicious Activity',
        severity: 'Medium',
        status: 'Active',
        latitude: 40.7148,
        longitude: -74.0080,
        locationName: 'Oak Street Park'
      },
      {
        reporter: users.primary._id,
        title: 'Water Main Leakage on Greenwood Lane',
        description: 'Large amount of water bubbling up through the road surface. DPW has been notified but please drive slowly through the area.',
        category: 'Water Leakage',
        severity: 'Low',
        status: 'Resolved',
        latitude: 40.7108,
        longitude: -74.0040,
        locationName: '123 Greenwood Lane'
      },
      {
        reporter: users['bob567@gmail.com']._id,
        title: 'Major Power Outage in Downtown Area',
        description: 'Entire block of downtown has lost electricity. Traffic lights are flashing red. Local utility is investigating.',
        category: 'Power Outage',
        severity: 'High',
        status: 'Investigating',
        latitude: 40.7168,
        longitude: -74.0020,
        locationName: 'Downtown Area'
      },
      {
        reporter: users['alina123@gmail.com']._id,
        title: 'Bicycle Theft from Pine Road Garage',
        description: 'A blue Trek hybrid mountain bike was stolen from an unlocked side garage door overnight. Please lock up your belongings.',
        category: 'Theft',
        severity: 'Medium',
        status: 'Active',
        latitude: 40.7088,
        longitude: -74.0100,
        locationName: 'Pine Road Garage'
      }
    ];

    // Insert
    await Resource.insertMany(resources);
    await Skill.insertMany(skills);
    await Alert.insertMany(alerts);

    console.log('Successfully seeded database with users, resources, skills, and alerts!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
