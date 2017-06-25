import {
    mongoose,
    User
} from './model';
import dotenv from 'dotenv';

dotenv.config();
mongoose.connect(process.env.STATS);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    User.find({}).then(users => {
        console.log('Number of users:', users.length);
    });
});
