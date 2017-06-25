'use strict';

var _model = require('./model');

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();
_model.mongoose.connect(process.env.STATS);

const db = _model.mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    _model.User.find({}).then(users => {
        console.log('Number of users:', users.length);
    });
});