const express = require('express');
const router = require('./routes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);



app.use('/', (req, res) => {
    res.status(400).json({ Message: "Invalid Route" });
});

app.listen(PORT, () => {
    console.log('port started on port => 5000')
});