'use strict';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
    verifyNumbers,
    addedWL,
    invalid,
    serverError,
    empty
} from './utils';

/*  code from:  https://gist.github.com/eloone/11342252#file-binaryinsert-js  */
const binaryInsert = (value, array, startVal, endVal) => {
    const length = array.length;
    const start = typeof(startVal) != 'undefined' ? startVal : 0;
    const end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
    const m = start + Math.floor((end - start)/2);

    if(length == 0){
        array.push(value);
        return;
    }

    if(value > array[end]){
        array.splice(end + 1, 0, value);
        return;
    }

    if(value < array[start]){//!!
        array.splice(start, 0, value);
        return;
    }

    if(start >= end){
        return;
    }

    if(value < array[m]){
        binaryInsert(value, array, start, m - 1);
        return;
    }

    if(value > array[m]){
        binaryInsert(value, array, m + 1, end);
        return;
    }
}

export default class DB {
    constructor() {
        const uristring = process.env.MONGODB_URI || 'mongodb://localhost/anilist_db';
        mongoose.connect(uristring);
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', () => {console.log('DB connected')});
        this.userSchema = mongoose.Schema({
            id: Number,
            animes: [Number]
        });
        this.User = mongoose.model('users', this.userSchema);
        const options = {upsert: true, new: true, setDefaultsOnInsert: true};
    }

    addEntry(user_id, anime_id) {
        return this.User.findOneAndUpdate({id: user_id}, {id: user_id}, this.options)
            .then(result => {
                // Add new anime id to the user
                if(result)
                    binaryInsert(anime_id, result.animes);
                else
                    result = new this.User({id: user_id, animes: [anime_id]});
                return result.save().then(data => addedWL)
                    .catch(error => {
                        console.log('[Error]AddEntry save:', error)
                        return serverError;
                    })
        }).catch(error => {
            console.log('[Error]AddEntry User:', error);
            return serverError;
        })
    }

    fetchAnimes(user_id) {
        return this.User.findOne({id: user_id})
            .then(data => {
                if(data) return data.animes;
                else return empty;
            })
            .catch(error => {
                console.log('[Error]fetchAnimes findOne:', error)
                return serverError;
            })
    }

    rmAnimes(user_id, anime_pos) {
        const positions = verifyNumbers(anime_pos);

        if(positions.length > 0)
            return this.User.findOneAndUpdate({id: user_id}, {id: user_id}, this.options)
                .then(result => {
                    if(result) {
                        // In case that the user has no anime is his list anymore
                        if(0 == result.animes.length)
                            return Promise.resolve(empty)
                                .catch(error => {
                                    console.log('[Error]rmAnimes else Promise:', error)
                                    return serverError;
                                }); 
                        else {
                            let counter = 0;
                            let removed = 0;
                            const size = result.animes.length;

                            for(let i in positions) {
                                removed = positions[i]-counter;
                                // Remove given anime
                                if(0 <= removed && removed < result.animes.length) {
                                    result.animes.splice(removed, 1);
                                    counter += 1;
                                }
                            }

                            // In this case, all postions that the user passed to remove were invalid
                            if(result.animes.length == size)
                                return Promise.resolve(invalid)
                                    .catch(error => {
                                        console.log('[Error]rmAnimes save:', error)
                                        return serverError;
                                    });
                            else
                                return result.save().then(data => result.animes)
                                    .catch(error => {
                                        console.log('[Error]rmAnimes save:', error)
                                        return serverError;
                                });
                        }
                    }
                    // If there's no result, that means that no user was found -- this implies that this user has no
                    // watchlist yet
                    else
                        return Promise.resolve(empty)
                            .catch(error => {
                                console.log('[Error]rmAnimes else Promise:', error)
                                return serverError;
                            });
            })
            .catch(error => {
                console.log('[Error]rmAnimes User:', error)
                return serverError;
            })
        else
            return Promise.resolve(invalid)
                .catch(error => {
                    console.log('[Error]rmAnimes else Promise:', error)
                    return serverError;
                });
    }
}
