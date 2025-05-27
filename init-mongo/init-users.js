db = db.getSiblingDB("admin");

db.createUser({
  user: "readuser",
  pwd: "readpass",
  roles: [{ role: "readWrite", db: "myapp" }]
});
