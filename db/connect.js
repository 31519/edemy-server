const mongoose = require('mongoose')
mongoose.set("strictQuery", false);

const connectDB = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("DB CONNECTED"))
.catch((err) => console.log('DB CONNECTION ERR'))
}

module.exports = connectDB