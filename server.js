// eslint-disable-next-line
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Unhandled Rejection! Shutting Down....');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE_STRING.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database Connection Successful!');
  });

// Remove all existing documents with the same name
// Tour.deleteMany({ name: testTour.name })
//   .then(() => {
// Save the new tour after removing the old ones

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting Down....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x);
