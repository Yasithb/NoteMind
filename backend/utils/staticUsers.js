// In-memory user store for demo purposes
// In a production environment, you would use a database or secure storage
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    // This is a hashed version of "password123"
    password: "$2a$12$QOpS/9KC5SXmKBgC1RYj/uOTH/Fyj/g.1SL6FUAOX1r1hNI.f14xW",
    createdAt: new Date("2025-01-01")
  }
];

export default users;