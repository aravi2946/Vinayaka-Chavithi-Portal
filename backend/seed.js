const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Settings = require('./models/Settings');
const Budget = require('./models/Budget');
const Collection = require('./models/Collection');
const Expense = require('./models/Expense');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const Volunteer = require('./models/Volunteer');
const Announcement = require('./models/Announcement');
const Gallery = require('./models/Gallery');
const Document = require('./models/Document');
const AuditLog = require('./models/AuditLog');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vinayaka_festival');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Settings.deleteMany({});
    await Budget.deleteMany({});
    await Collection.deleteMany({});
    await Expense.deleteMany({});
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    await Volunteer.deleteMany({});
    await Announcement.deleteMany({});
    await Gallery.deleteMany({});
    await Document.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Create Default Users (Password hashing occurs in pre-save hook)
    const admin = await User.create({
      username: 'admin',
      password: 'AdminPassword123!',
      role: 'Super Admin',
      status: 'Active',
    });

    await User.create({
      username: 'treasurer',
      password: 'TreasurerPassword123!',
      role: 'Treasurer',
      status: 'Active',
    });

    await User.create({
      username: 'eventmanager',
      password: 'EventPassword123!',
      role: 'Event Manager',
      status: 'Active',
    });

    await User.create({
      username: 'volunteermanager',
      password: 'VolunteerPassword123!',
      role: 'Volunteer Manager',
      status: 'Active',
    });

    await User.create({
      username: 'contentmanager',
      password: 'ContentPassword123!',
      role: 'Content Manager',
      status: 'Active',
    });

    console.log('Seeded committee users.');

    // 2. Create Settings
    const settings = await Settings.create({
      festivalName: 'Vinayaka Chavithi Utsav 2026',
      committeeName: 'Adyar Ganesha Utsav Committee',
      festivalYear: 2026,
      festivalDates: 'September 14 - September 19, 2026',
      logoUrl: '', // Defaults to sacred 🕉️ emblem unless custom logo uploaded
      ganeshaImageUrl: '', // Defaults to built-in celebratory vector banner
      contactInfo: '+91 98450 12345, info@adyarganesha.org',
      publicCollectionVisibility: true,
      registrationSettings: true,
      announcementSettings: true,
      paymentNumber: '9948050484',
      accountName: 'UPPUTURI VENKATA GANESH',
      idolSponsorActive: true,
      idolSponsorName: 'UPPUTURI VENKATA GANESH',
      idolSponsorDetails: 'Grand 9ft Eco-Friendly Clay Ganesha Idol Seva',
      idolSponsorMessage: 'Heartfelt gratitude and Lord Vinayaka blessings to the sponsor family for divine patronage.',
      instagramUrl: 'https://instagram.com/',
      instagramHandle: '@vinayaka_utsav',
    });

    console.log('Seeded settings.');

    // 3. Create Budgets
    const budgets = [
      { category: 'Decorations', budgetedAmount: 50000 },
      { category: 'Puja materials', budgetedAmount: 15000 },
      { category: 'Food/Annadanam', budgetedAmount: 60000 },
      { category: 'Sound system', budgetedAmount: 20000 },
      { category: 'Lighting', budgetedAmount: 15000 },
      { category: 'Stage', budgetedAmount: 30000 },
      { category: 'Transportation', budgetedAmount: 10000 },
      { category: 'Security', budgetedAmount: 12000 },
      { category: 'Cultural programs', budgetedAmount: 25000 },
      { category: 'Printing', budgetedAmount: 5000 },
      { category: 'Cleaning', budgetedAmount: 8000 },
      { category: 'Other', budgetedAmount: 10000 },
    ];
    await Budget.insertMany(budgets);
    console.log('Seeded category budgets.');

    // 4. Create Collections (Donations)
    const collections = [
      {
        collectionId: 'COLL-1001',
        date: new Date('2026-08-10T10:00:00Z'),
        donorName: 'Rajesh Kumar',
        phone: '9845011111',
        amount: 15000,
        paymentMode: 'UPI',
        transactionRef: 'UPI8892749281',
        purpose: 'Annadanam Donation',
        notes: 'Dedicated for Sept 15 Annadanam',
        addedBy: 'treasurer',
        approvalStatus: 'Approved',
        showPublicly: true,
      },
      {
        collectionId: 'COLL-1002',
        date: new Date('2026-08-12T14:30:00Z'),
        donorName: 'Suresh Mehta',
        phone: '9845022222',
        amount: 25000,
        paymentMode: 'Bank Transfer',
        transactionRef: 'TXN8391823901',
        purpose: 'Puja Materials',
        notes: 'Sponsored puja materials',
        addedBy: 'treasurer',
        approvalStatus: 'Approved',
        showPublicly: false,
      },
      {
        collectionId: 'COLL-1003',
        date: new Date('2026-08-15T09:15:00Z'),
        donorName: 'Anitha Sharma',
        phone: '9845033333',
        amount: 5000,
        paymentMode: 'Cash',
        purpose: 'General Donation',
        notes: 'Handed cash directly to committee',
        addedBy: 'treasurer',
        approvalStatus: 'Approved',
        showPublicly: true,
      },
      {
        collectionId: 'COLL-1004',
        date: new Date('2026-08-18T18:00:00Z'),
        donorName: 'K. Ramachandra',
        phone: '9845044444',
        amount: 10000,
        paymentMode: 'UPI',
        transactionRef: 'UPI7728392182',
        purpose: 'Decorations Sponsorship',
        notes: 'For flowers and lights',
        addedBy: 'admin',
        approvalStatus: 'Approved',
        showPublicly: false,
      },
      {
        collectionId: 'COLL-1005',
        date: new Date('2026-08-20T11:00:00Z'),
        donorName: 'Priya Patel',
        phone: '9845055555',
        amount: 2000,
        paymentMode: 'Cash',
        purpose: 'General Donation',
        notes: 'Draft entry for review',
        addedBy: 'treasurer',
        approvalStatus: 'Draft',
        showPublicly: false,
      },
      {
        collectionId: 'COLL-1006',
        date: new Date('2026-08-21T12:00:00Z'),
        donorName: 'Vikram Singh',
        phone: '9845066666',
        amount: 8000,
        paymentMode: 'UPI',
        transactionRef: 'UPI2938102931',
        purpose: 'Cultural Program Support',
        notes: 'Submitted for verification',
        addedBy: 'treasurer',
        approvalStatus: 'Submitted',
        showPublicly: false,
      },
    ];
    await Collection.insertMany(collections);
    console.log('Seeded collections.');

    // 5. Create Expenses
    const expenses = [
      {
        expenseId: 'EXP-1001',
        date: new Date('2026-08-12T11:00:00Z'),
        expenseCategory: 'Decorations',
        description: 'Advance payment for main Mandap structure and tenting',
        amount: 25000,
        paidTo: 'Venkateswara Tents & Decors',
        paymentMode: 'Bank Transfer',
        billReceiptNo: 'BILL-190',
        notes: '50% advance, remaining after assembly',
        addedBy: 'treasurer',
        approvalStatus: 'Approved',
      },
      {
        expenseId: 'EXP-1002',
        date: new Date('2026-08-14T16:00:00Z'),
        expenseCategory: 'Puja materials',
        description: 'Purchase of idols components and puja essentials',
        amount: 8000,
        paidTo: 'Sri Rama Puja Stores',
        paymentMode: 'Cash',
        billReceiptNo: 'BILL-872',
        notes: 'Receipt attached',
        addedBy: 'treasurer',
        approvalStatus: 'Approved',
      },
      {
        expenseId: 'EXP-1003',
        date: new Date('2026-08-16T12:00:00Z'),
        expenseCategory: 'Printing',
        description: 'Printing of pamphlets, schedules, and donation receipts',
        amount: 3500,
        paidTo: 'Maruthi Printers',
        paymentMode: 'UPI',
        transactionRef: 'UPI9019283921',
        billReceiptNo: 'INV-4412',
        notes: 'Includes delivery charges',
        addedBy: 'treasurer',
        approvalStatus: 'Approved',
      },
      {
        expenseId: 'EXP-1004',
        date: new Date('2026-08-20T10:00:00Z'),
        expenseCategory: 'Sound system',
        description: 'Advance payment for speakers and amplifiers rental',
        amount: 5000,
        paidTo: 'Super Sound System',
        paymentMode: 'UPI',
        transactionRef: 'UPI2010293129',
        notes: 'Under review',
        addedBy: 'treasurer',
        approvalStatus: 'Draft',
      },
      {
        expenseId: 'EXP-1005',
        date: new Date('2026-08-22T15:00:00Z'),
        expenseCategory: 'Food/Annadanam',
        description: 'Purchase of groceries for Day 1 Annadanam',
        amount: 15000,
        paidTo: 'Reliance Smart Bazaar',
        paymentMode: 'UPI',
        transactionRef: 'UPI1029381029',
        billReceiptNo: 'BILL-8291',
        notes: 'Submitted by treasurer',
        addedBy: 'treasurer',
        approvalStatus: 'Submitted',
      },
    ];
    await Expense.insertMany(expenses);
    console.log('Seeded expenses.');

    // 6. Create Events
    const sthapanaDate = new Date('2026-09-14T00:00:00Z');
    const annadanamDate = new Date('2026-09-15T00:00:00Z');
    const culturalDate = new Date('2026-09-17T00:00:00Z');
    const nimajjanamDate = new Date('2026-09-19T00:00:00Z');

    const event1 = await Event.create({
      eventId: 'EVT-1001',
      eventName: 'Vinayaka Idol Sthapana & Pranapratishtha',
      date: sthapanaDate,
      startTime: '08:00',
      endTime: '11:30',
      venue: 'Main Central Mandap, Adyar',
      description: 'Installing the main Ganesha idol with special Vedic chants and puja.',
      organizer: 'Veda Pathashala Priests',
      maxParticipants: 0,
      registrationRequired: false,
      status: 'Active',
      isPublished: true,
    });

    const event2 = await Event.create({
      eventId: 'EVT-1002',
      eventName: 'Maha Annadanam (Community Feast)',
      date: annadanamDate,
      startTime: '12:00',
      endTime: '15:30',
      venue: 'Dining Arena (Adjacent to Mandap)',
      description: 'Providing food/prasadam to all devotees. Sponsorships accepted.',
      organizer: 'Annadanam Volunteer Team',
      maxParticipants: 0,
      registrationRequired: false,
      status: 'Active',
      isPublished: true,
    });

    const event3 = await Event.create({
      eventId: 'EVT-1003',
      eventName: 'Devotional Songs & Bhajan Sandhya',
      date: culturalDate,
      startTime: '18:30',
      endTime: '21:00',
      venue: 'Cultural Stage',
      description: 'Devotional bhajans by local youth troupe and experts.',
      organizer: 'Cultural Coordinator',
      maxParticipants: 0,
      registrationRequired: false,
      status: 'Active',
      isPublished: true,
    });

    const event4 = await Event.create({
      eventId: 'EVT-1004',
      eventName: 'Kids Ganesha Drawing & Sloka Competition',
      date: culturalDate,
      startTime: '10:00',
      endTime: '13:00',
      venue: 'Mandap Hall',
      description: 'Ganesha themed painting/drawing and sloka recitation for children under 15.',
      organizer: 'Event Management Team',
      maxParticipants: 50,
      registrationRequired: true,
      status: 'Active',
      isPublished: true,
    });

    const event5 = await Event.create({
      eventId: 'EVT-1005',
      eventName: 'Grand Ganesh Nimajjanam (Immersion)',
      date: nimajjanamDate,
      startTime: '14:00',
      endTime: '20:00',
      venue: 'Central Mandap to Beach Procession',
      description: 'Traditional immersion procession with music, dancing, and prayers.',
      organizer: 'Nimajjanam Committee',
      maxParticipants: 0,
      registrationRequired: false,
      status: 'Active',
      isPublished: true,
    });

    console.log('Seeded events.');

    // 7. Seed Event Registrations
    await EventRegistration.create({
      participantName: 'Sanjay Sharma',
      age: 10,
      phone: '9845012345',
      event: event4._id,
      category: 'Drawing (Under 12)',
      registrationStatus: 'Approved',
    });

    await EventRegistration.create({
      participantName: 'Divya Reddy',
      age: 12,
      phone: '9845077777',
      event: event4._id,
      category: 'Sloka Recitation',
      registrationStatus: 'Pending',
    });

    console.log('Seeded event registrations.');

    // 8. Seed Volunteers
    await Volunteer.create({
      name: 'Abhishek Rao',
      phone: '9845088888',
      area: 'Adyar West',
      skills: 'Crowd control, first aid',
      availability: 'All days, evenings',
      assignedResponsibility: 'Crowd Management',
      status: 'Active',
    });

    await Volunteer.create({
      name: 'Meera Deshmukh',
      phone: '9845099999',
      area: 'Shastri Nagar',
      skills: 'Food serving, logistics',
      availability: 'Annadanam day (Sept 15)',
      assignedResponsibility: 'Food',
      status: 'Active',
    });

    await Volunteer.create({
      name: 'Rohan Joshi',
      phone: '9845054321',
      area: 'Adyar East',
      skills: 'Stage assembly, wiring',
      availability: 'Sept 13 and Sept 14',
      assignedResponsibility: 'Decorations',
      status: 'Active',
    });

    console.log('Seeded volunteers.');

    // 9. Seed Announcements
    await Announcement.create({
      title: 'Devotee Prasadam Timings Announced',
      description: 'Laddoo prasadam distribution starts daily after Maha Aarti at 12:30 PM and 8:30 PM. Collect your tokens at the counter.',
      date: new Date('2026-08-20T00:00:00Z'),
      priority: 'Medium',
      isPublished: true,
    });

    await Announcement.create({
      title: 'Drawing & Sloka Competition Registration Open!',
      description: 'Registrations are open for the Kids Drawing & Sloka Competition. Last date to register is September 16th. Limited seats!',
      date: new Date('2026-08-22T00:00:00Z'),
      priority: 'High',
      isPublished: true,
    });

    await Announcement.create({
      title: 'Volunteer Meeting Scheduled',
      description: 'All registered volunteers are requested to join the prep meeting on September 11th at 6:00 PM at the Central Mandap.',
      date: new Date('2026-08-23T00:00:00Z'),
      priority: 'Low',
      isPublished: true,
    });

    console.log('Seeded announcements.');

    // 10. Seed Gallery
    await Gallery.create({
      imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800',
      caption: 'Main Central Mandap Assembly and Tenting work in progress',
      eventCategory: 'Decorations',
      isPublished: true,
    });

    await Gallery.create({
      imageUrl: 'https://images.unsplash.com/photo-1624896238624-9b2f216260f8?auto=format&fit=crop&q=80&w=800',
      caption: 'Pooja Thali preparation for Sthapana day',
      eventCategory: 'Sthapana',
      isPublished: true,
    });

    await Gallery.create({
      imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800',
      caption: 'Annadanam kitchen layout and ingredients preparation',
      eventCategory: 'Annadanam',
      isPublished: true,
    });

    console.log('Seeded gallery images.');

    // 11. Seed Documents
    await Document.create({
      documentName: 'Adyar Central Ganesha Festival Schedule 2026',
      fileUrl: 'https://www.adyarganesha.org/documents/schedule_2026.pdf',
      visibility: 'Public',
      documentType: 'Schedule',
      addedBy: 'admin',
    });

    await Document.create({
      documentName: 'Kids Painting and Recitation Rules & Guidelines',
      fileUrl: 'https://www.adyarganesha.org/documents/competition_rules.pdf',
      visibility: 'Public',
      documentType: 'Rules',
      addedBy: 'admin',
    });

    await Document.create({
      documentName: 'Police Procession & Sound Permission NOC Document',
      fileUrl: 'https://www.adyarganesha.org/documents/noc_police_permission.pdf',
      visibility: 'Committee Only',
      documentType: 'Permission',
      addedBy: 'admin',
    });

    await Document.create({
      documentName: 'Budget Meeting Minutes (July 2026)',
      fileUrl: 'https://www.adyarganesha.org/documents/budget_minutes_july.pdf',
      visibility: 'Committee Only',
      documentType: 'Meeting Minutes',
      addedBy: 'admin',
    });

    console.log('Seeded document lists.');

    // 12. Seed Audit Log
    await AuditLog.create({
      user: 'System',
      action: 'Initial Seeding of Database Done',
      recordType: 'Database',
      recordId: 'SYSTEM',
      newValue: 'Initial State Seeded',
    });

    console.log('Seed successful! All tables pre-populated.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
