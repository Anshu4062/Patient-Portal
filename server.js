/* eslint-disable no-unused-vars */
// server.js - Node.js Backend API
import express from "express";
import { promises as fs } from "fs";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import process from "process";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// Middleware
app.use(cors());
app.use(express.json());

// File paths for data storage
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");

// Initialize data directory and files
const initializeDataFiles = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Initialize users file
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([]));
    }

    // Initialize patients file
    try {
      await fs.access(PATIENTS_FILE);
    } catch {
      await fs.writeFile(PATIENTS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error initializing data files:", error);
  }
};

// Helper functions for file operations
const readUsersFile = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

const writeUsersFile = async (users) => {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
    throw error;
  }
};

const readPatientsFile = async () => {
  try {
    const data = await fs.readFile(PATIENTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading patients file:", error);
    return [];
  }
};

const writePatientsFile = async (patients) => {
  try {
    await fs.writeFile(PATIENTS_FILE, JSON.stringify(patients, null, 2));
  } catch (error) {
    console.error("Error writing patients file:", error);
    throw error;
  }
};

// JWT middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// ROUTES
