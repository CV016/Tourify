const mongoose = require('mongoose');

const dotenv = require('dotenv');

const fs = require('fs');

const Tour = require('../../models/tourModels');

dotenv.config({ path: './config.env' });

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
  })
  .catch((error) => {
    console.error('Database Connection Error:', error);
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded successfully');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

// console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
