const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = 'mongodb://readuser:readpass@mongodb:27017/myapp';
const client = new MongoClient(uri);

app.get('/', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("myapp");
    const collections = await db.listCollections().toArray();
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => console.log('Backend pe http://localhost:5000'));
