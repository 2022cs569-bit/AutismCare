const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect DB
    await mongoose.connect(process.env.MONGO_URI);

    // Remove existing users (optional but recommended)
    await User.deleteMany();

    const hashedPassword = await bcrypt.hash('Password123', 10);

    const users = [
      {
        fullName: "Parent One",
        email: "parent1@example.com",
        phone: "+923001112233",
        password: hashedPassword,
        roles: ["parent"],
        primaryRole: "parent",
        accountStatus: "approved"
      },
      {
        fullName: "Dr. Ali",
        email: "doctor1@example.com",
        phone: "+923001112244",
        password: hashedPassword,
        roles: ["doctor"],
        primaryRole: "doctor",
        organization: "AutismCare Hospital",
        licenseNumber: "DOC12345",
        specialty: "Pediatrics",
        experienceYears: 5,
        qualification: "MBBS",
        accountStatus: "approved"
      },
      {
        fullName: "Therapist Sara",
        email: "therapist1@example.com",
        phone: "+923001112255",
        password: hashedPassword,
        roles: ["therapist"],
        primaryRole: "therapist",
        organization: "AutismCare Clinic",
        licenseNumber: "TH12345",
        specialty: "ABA",
        therapyType: "ABA",
        accountStatus: "approved"
      },
      {
        fullName: "Lab A",
        email: "lab1@example.com",
        phone: "+923001112266",
        password: hashedPassword,
        roles: ["laboratory"],
        primaryRole: "laboratory",
        organization: "AutismCare Lab",
        licenseNumber: "LAB123",
        labAddress: "123 Lab Street",
        labType: "general",
        accountStatus: "approved"
      },
      {
        fullName: "Admin One",
        email: "admin1@example.com",
        phone: "+923001112277",
        password: hashedPassword,
        roles: ["admin"],
        primaryRole: "admin",
        permissions: ["manageUsers", "viewReports", "manageTherapies"],
        accountStatus: "approved"
      }
    ];

    await User.insertMany(users);
    console.log("✅ Users seeded successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();
