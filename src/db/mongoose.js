const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then((result) => {
    console.log('Connected to database')
}).catch((error) => {
    console.log('Error while connecting.')
})