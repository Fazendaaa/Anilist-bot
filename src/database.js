'use strict';

import mongoose from 'mongoose';
import {verifyNumbers} from './utils';

/*  When this messages are into DB class construtctor they didn't work properly */
const addedWL = 'Added to your watchlist!\nTo see it just open a chat with ANILISTbot and type /watchlist';
const invalid = '*Invalid anime positon. Please send anime index that you want to remove.*';

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
        mongoose.connect('mongodb://localhost/anilist_db');
        this.userSchema = mongoose.Schema({
            id: Number,
            animes: [Number]
        });
        this.User = mongoose.model('users', this.userSchema);
        const options = {upsert: true, new: true, setDefaultsOnInsert: true};
    }

    addEntry(user_id, anime_id) {
        
        return Promise.resolve(
            this.User.findOneAndUpdate({id: user_id}, {id: user_id}, this.options)
                .then(result => {
                    /*  Add new anime id to the user    */
                    binaryInsert(anime_id, result.animes);
                    return result.save().then(data => addedWL)
                                        .catch(err => console.log('[Error]AddEntry save:', error))
                }).catch(error => console.log('[Error]AddEntry User:', error))
        ).catch(error => console.log('[Error]AddEntry Promise:', error));
    }

    fetchAnimes(user_id) {
        return Promise.resolve(
            this.User.findOne({id: user_id}).then(data => data.animes)
                                            .catch(error =>console.log('[Error]fetchAnimes findOne:', error))
        ).catch(error => console.log('[Error]fetchAnimes Promise:', error));
    }

    rmAnimes(user_id, anime_pos) {
        const positions = verifyNumbers(anime_pos);

        if(positions.length > 0)
            return Promise.resolve(
                this.User.findOneAndUpdate({id: user_id}, {id: user_id}, this.options)
                    .then(result => {
                        let counter = 0;

                        for(let i in positions) {
                            /*  Remove given anime  */
                            if(0 <= positions[i] && positions[i] < result.animes.length) {
                                result.animes.splice(positions[i]-counter, 1);
                                counter = 1;
                            }
                        }

                        return result.save().then(data => result.animes)
                                            .catch(err => console.log('[Error]rmAnimes save:', error));
                    }).catch(error => console.log('[Error]rmAnimes User:', error))
            ).catch(error => console.log('[Error]rmAnimes if Promise:', error));
        else
            return Promise.resolve(invalid)
                          .catch(error => console.log('[Error]rmAnimes else Promise:', error));
    }
}
