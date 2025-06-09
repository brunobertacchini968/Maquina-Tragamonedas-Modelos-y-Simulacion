const express = require('express');
const cors = require('cors');
const path = require('path');
const { spinController } = require('./controllers/slotController');
const slotSymbols = require("./models/slotSymbols")

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

app.post('/spin', spinController);

app.listen(port, () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.get("/symbols", (req, res) => {
  res.json(slotSymbols.symbols);
});



