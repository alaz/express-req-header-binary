const express = require('express');

const app = express();

app.get('/', (_req, res) => res.status(204).end());
app.listen(8080);
