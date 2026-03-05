const mongoose = require('mongoose');
const { User } = require('../models/User.js');
const connectDB = require('../config/database.js');

const seedUsers = async () => {
  await connectDB();
  await User.deleteMany({});
  const users = [
    {
      firstName: "Parent",
      lastName: "One",
      email: "akramhun04@gmail.com",
      phoneNumber: "+923001112233",
      password: "Password123",
      role: "parent",
      isEmailVerified: true
    },
    {
      firstName: "Ali",
      lastName: "Khan",
      email: "lesstareen@gmail.com",
      phoneNumber: "+923001112244",
      password: "Password123",
      role: "clinician",
      specialization: "Pediatrics",
      licenseNumber: "DOC12345",
      approvalStatus: "active",
      isEmailVerified: true
    },
    {
      firstName: "Sara",
      lastName: "Ahmed",
      email: "therapist1@example.com",
      phoneNumber: "+923001112255",
      password: "Password123",
      role: "therapist",
      specialization: "ABA Therapy",
      licenseNumber: "TH12345",
      approvalStatus: "active",
      isEmailVerified: true
    },
    {
      firstName: "Lab",
      lastName: "A",
      email: "lab1@example.com",
      phoneNumber: "+923001112266",
      password: "Password123",
      role: "lab",
      labName: "AutismCare Lab",
      accreditation: "ISO 9001",
      isEmailVerified: true
    },
    {
      firstName: "Admin",
      lastName: "One",
      email: "admin1@example.com",
      phoneNumber: "+923001112277",
      password: "Password123",
      role: "admin",
      isEmailVerified: true
    }
  ];

  for (const userData of users) {
    const user = new User(userData);
    await user.save();
  }
  console.log("Users seeded.");
};

seedUsers().catch(console.error);
