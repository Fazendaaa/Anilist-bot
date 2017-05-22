'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*  code from:  https://gist.github.com/eloone/11342252#file-binaryinsert-js  */
const binaryInsert = (value, array, startVal, endVal) => {
    const length = array.length;
    const start = typeof startVal != 'undefined' ? startVal : 0;
    const end = typeof endVal != 'undefined' ? endVal : length - 1; //!! endVal could be 0 don't use || syntax
    const m = start + Math.floor((end - start) / 2);

    if (length == 0) {
        array.push(value);
        return;
    }

    if (value > array[end]) {
        array.splice(end + 1, 0, value);
        return;
    }

    if (value < array[start]) {
        //!!
        array.splice(start, 0, value);
        return;
    }

    if (start >= end) {
        return;
    }

    if (value < array[m]) {
        binaryInsert(value, array, start, m - 1);
        return;
    }

    if (value > array[m]) {
        binaryInsert(value, array, m + 1, end);
        return;
    }
};

class DB {
    constructor() {
        const uristring = process.env.MONGODB_URI || 'mongodb://localhost/anilist_db';
        _mongoose2.default.connect(uristring);
        const db = _mongoose2.default.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', () => {
            console.log('DB connected');
        });
        this.userSchema = _mongoose2.default.Schema({
            id: Number,
            animes: [Number]
        });
        this.User = _mongoose2.default.model('users', this.userSchema);
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    }

    addEntry(user_id, anime_id) {
        return this.User.findOneAndUpdate({ id: user_id }, { id: user_id }, this.options).then(result => {
            // Add new anime id to the user
            if (result) binaryInsert(anime_id, result.animes);else result = new this.User({ id: user_id, animes: [anime_id] });
            return result.save().then(data => _utils.addedWL).catch(error => {
                console.log('[Error]AddEntry save:', error);
                return _utils.serverError;
            });
        }).catch(error => {
            console.log('[Error]AddEntry User:', error);
            return _utils.serverError;
        });
    }

    fetchAnimes(user_id) {
        return this.User.findOne({ id: user_id }).then(data => {
            if (data) return data.animes;else return _utils.empty;
        }).catch(error => {
            console.log('[Error]fetchAnimes findOne:', error);
            return _utils.serverError;
        });
    }

    rmAnimes(user_id, anime_pos) {
        const positions = (0, _utils.verifyNumbers)(anime_pos);

        if (positions.length > 0) return this.User.findOneAndUpdate({ id: user_id }, { id: user_id }, this.options).then(result => {
            if (result) {
                // In case that the user has no anime is his list anymore
                if (0 == result.animes.length) return Promise.resolve(_utils.empty).catch(error => {
                    console.log('[Error]rmAnimes else Promise:', error);
                    return _utils.serverError;
                });else {
                    let counter = 0;
                    let removed = 0;
                    const size = result.animes.length;

                    for (let i in positions) {
                        removed = positions[i] - counter;
                        // Remove given anime
                        if (0 <= removed && removed < result.animes.length) {
                            result.animes.splice(removed, 1);
                            counter += 1;
                        }
                    }

                    // In this case, all postions that the user passed to remove were invalid
                    if (result.animes.length == size) return Promise.resolve(_utils.invalid).catch(error => {
                        console.log('[Error]rmAnimes save:', error);
                        return _utils.serverError;
                    });else return result.save().then(data => result.animes).catch(error => {
                        console.log('[Error]rmAnimes save:', error);
                        return _utils.serverError;
                    });
                }
            }
            // If there's no result, that means that no user was found -- this implies that this user has no
            // watchlist yet
            else return Promise.resolve(_utils.empty).catch(error => {
                    console.log('[Error]rmAnimes else Promise:', error);
                    return _utils.serverError;
                });
        }).catch(error => {
            console.log('[Error]rmAnimes User:', error);
            return _utils.serverError;
        });else return Promise.resolve(_utils.invalid).catch(error => {
            console.log('[Error]rmAnimes else Promise:', error);
            return _utils.serverError;
        });
    }
}
exports.default = DB;