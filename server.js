const express = require("express");
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const static = path.resolve(__dirname, 'dist');
const index = path.resolve(static, 'index.html');

app.use(cors());
app.use(express.static(static));

app.get('*', (req, res) => {
  res.sendFile(index);
});

app.listen(port, () => {
  console.log("App Running");
});