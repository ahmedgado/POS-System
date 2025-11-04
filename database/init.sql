-- POS System Database Initialization
-- This file is executed when the PostgreSQL container is first created

-- Create database if not exists (handled by Docker)
-- CREATE DATABASE pos_db;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create initial schema
-- Tables will be created by Prisma migrations
-- This file is for initial data seeding only

-- Default admin user will be created by backend seed script
