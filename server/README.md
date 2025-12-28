# Server Folder Structure

## Routes
API route definitions - handles HTTP requests and delegates to controllers

## Controllers
Business logic for handling requests - processes data and returns responses

## Models
Database models and schemas (Prisma will generate these)

## Config
Configuration files for database, middleware, etc.

## Structure Overview:
```
server/
├── server.js           # Main server file
├── routes/            # API routes
├── controllers/       # Request handlers
├── models/           # Database models
├── config/           # Configuration
└── .env              # Environment variables
```
