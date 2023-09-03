const express = require('express');
const db = require('./db/connection');
const initialPrompt = require('./lib/employee-tracker');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.connect(err => {
    if(err) {
        console.error(err);
    }
    
    initialPrompt();
})

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
