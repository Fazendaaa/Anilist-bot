'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodeSchedule = require('node-schedule');

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _model = require('./model');

var _utils = require('./utils');

var _search = require('./search');

var _bot = require('./bot');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DB {
    constructor() {
        const uristring = process.env.MONGODB_URI;
        _model.mongoose.connect(uristring);
        this.db = _model.mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', () => console.log('DB connected'));
        // Opitions to add a new entry case it doesn't already exist
        this.options = { upsert: true, new: true, setDefaultsOnInsert: true };
    }

    /**
     * This functions adds an anime to notitications system so, that way, user can be notified upon new episodes.
     * @param {Number} _id - Anime ID.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addAnimeNotifications(_id) {
        return (0, _search.searchAnimeRelaseDate)(_id).then(time => {
            // For  now  only  add  animes  that  are currently airing since those are the only to release new episodes.
            // Wheter  or  not  an  anime is coming out from an hiatus, only when a new user added it to his subscpriton
            // list  it's going to enable notifications. The bright side is that when this occours all user subscrptions
            // to  this  anime  will start to be notified as weel. If added those animes whom aren't airing the database
            // will grow much more and the need for space will grow as well -- tl;dr: I want to save DB storage money.
            if (time) return _model.Notifications.findOneAndUpdate({ _id: _id, type: true, time: time }, {}, this.options).then(anime => {
                return anime.save().then(data => true).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });else return false;
        }).catch(error => {
            console.log('[Error] DB addAnimeNotifications:', error);
            return _utils.serverError;
        });
    }

    /**
     * This function is a mock up only. Since manga notifications are not yet available.
     * @param {Number} manga_id - Anime ID.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addMangaNotifications(manga_id) {}

    /**
     * This functions adds an content to notitications system so, that way, user can be notified upon new releases.
     * @param {Boolean} type - Content type.
     * @param {Number} type_id - Content ID.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addNotifications(type, type_id) {
        return type ? this.addAnimeNotifications(type_id) : this.addMangaNotifications(type_id);
    }

    /**
     * This function adds a new user, case there's none and verifies wheter he want's to be notified upon new releases.
     * @param {Number} _id - User ID.
     * @param {Mongoose's JSON} subscription - New subscription.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addUser(_id, subscription) {
        return _model.User.findByIdAndUpdate({ _id: _id }, {}, this.options).then(user => {
            // In case that the user doesn't want to be notified
            if (!user.notify) subscription.notify = false;

            return subscription.save().then(subs => {
                return user.save().then(data => true).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            console.log('[Error] DB addUser:', error);
            return undefined;
        });
    }

    /**
     * Add a new subscription to database so that the user can be notifed upon the releases.
     * @param {Number} user - User ID.
     * @param {Number} content - Content ID.
     * @param {String} kind - Type of content.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    subscribe(user, content, kind) {
        const type = 'anime' == kind ? true : false;
        // See if user is already subscribed to this content
        return _model.Subscription.findOne({ user: user, content: content, type: type }).then(subscribed => {
            if (!subscribed) {
                const subscription = new _model.Subscription();
                subscription.user = user;
                subscription.content = content;
                subscription.type = type;

                return this.addUser(user, subscription).then(added => {
                    // So far only add notifications to anime type.
                    if (added && type) this.addNotifications(type, content);
                    return added;
                }).catch(error => {
                    throw error;
                });
            }
            // User already subscribed to this content
            else return false;
        }).catch(error => {
            console.log('[Error] DB subscribe:', error);
            return undefined;
        });
    }

    /**
     * Remove content subscription from database.
     * @param {Number} user - User ID.
     * @param {Number} content - Content ID.
     * @param {String} kind - Type of content.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    unsubscribe(user, content, kind) {
        const type = 'anime' == kind ? true : false;

        return _model.Subscription.findOne({ user: user, content: content, type: type }).remove().then(counter => {
            return counter ? true : false;
        }).catch(error => {
            console.log('[Error] DB unsubscribe:', error);
            return undefined;
        });
    }

    /**
     * Fetch all content of given type related to user's subscription.
     * @param {Number} user - User ID.
     * @param {Boolean} type - Type of content.
     * @returns {JSON} Content fetched.
     */
    fetchAll(user, type) {
        // This must be only 'find', because if it's findOne, not all subscriptions will be returned.
        return _model.Subscription.find({ user: user, type: type }).then(subscription => {
            if (0 < subscription.length) return subscription.map(element => {
                return {
                    content: element.content,
                    notify: element.notify
                };
            });else return undefined;
        }).catch(error => {
            console.log(`[Error] DB fetchAll${type ? 'Anime' : 'Manga'}:`, error);
            return { Error: _utils.serverError };
        });
    }

    /**
     * Fetch specifc content of given type related to user's subscription.
     * @param {Number} user - User ID.
     * @param {Boolean} type - Type of content.
     * @returns {JSON} Content fetched.
     */
    fetchOne(user, content, type) {
        return _model.Subscription.findOne({ user: user, content: content, type: type }).then(subscription => {
            return {
                content: subscription.content,
                notify: subscription.notify
            };
        }).catch(error => {
            console.log(`[Error] DB fetchOne${type ? 'Anime' : 'Manga'}:`, error);
            return { Error: _utils.serverError };
        });
    }

    /**
     * Fetch all animes related to user's subscription.
     * @param {Number} user - User ID.
     * @returns {JSON} Content fetched.
     */
    fetchAnimes(user_id) {
        return this.fetchAll(user_id, true);
    }

    /**
     * Fetch all mangas related to user's subscription.
     * @param {Number} user - User ID.
     * @returns {JSON} Content fetched.
     */
    fetchMangas(user_id) {
        return this.fetchAll(user_id, false);
    }

    /**
     * Fetch one anime related to user's subscription.
     * @param {Number} user_id - User ID.
     * @param {Number} anime_id - Anime ID.
     * @returns {JSON} Content fetched.
     */
    fetchAnime(user_id, anime_id) {
        return this.fetchOne(user_id, anime_id, true);
    }

    /**
     * Fetch one manga related to user's subscription.
     * @param {Number} user - User ID.
     * @param {Number} manga_id - Manga ID.
     * @returns {JSON} Content fetched.
     */
    fetchManga(user_id, manga_id) {
        return this.fetchOne(user_id, manga_id, false);
    }

    /**
     * Fetch user content.
     * @param {Number} _id - User ID.
     * @returns {JSON} User content.
     */
    fetchUser(_id) {
        // In create a new user in case that he hasn't any saved data yet.
        return _model.User.findOneAndUpdate({ _id: _id }, {}, this.options).then(user => {
            return user.save().then(data => data).catch(error => {
                throw error;
            });
        }).catch(error => {
            console.log('[Error] DB fetchUser:', error);
            return false;
        });
    }

    /**
    * This function seeks all user subscriptions the toggle its notifications.
    * @param {Number} user - User ID.
    * @param {Boolean} notify - New notification status.
    * @returns {Boolean} New user notitifcation status.
    */
    toggleAllSubscriptions(user, notify) {
        return _model.Subscription.update({ user: user }, { notify: notify }, { multi: true }).then(counter => {
            return counter ? true : false;
        }).catch(error => {
            console.log('[Error] DB toggleAllSubscriptions:', error);
            return { Error: _utils.serverError };
        });
    }

    /**
     * This function toggle user's notifications.
     * @param {Number} _id - User ID.
     * @returns {Boolean} New user notitifcation status.
     */
    toggleNotifications(_id) {
        return _model.User.findOneAndUpdate({ _id: _id }, {}, this.options).then(user => {
            // Toggle notifications
            user.notify = !user.notify;

            return user.save().then(data => {
                this.toggleAllSubscriptions(_id, data.notify);
                return data.notify;
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            console.log('[Error] DB toggleNotifications:', error);
            return false;
        });
    }

    /**
     * This function seeks given anime and user the toggle its notifications.
     * @param {Number} user - User ID.
     * @param {Number} content - Anime ID.
     * @returns {Boolean} New anime notitifcation status.
     */
    toggleAnime(user, content) {
        return _model.Subscription.findOne({ user: user, content: content, type: true }).then(subscription => {
            subscription.notify = !subscription.notify;
            return subscription.save().then(data => data.notify).catch(error => {
                throw error;
            });
        }).catch(error => {
            console.log('[Error] DB toggleAnime:', error);
            return undefined;
        });
    }

    /**
     * This function fetchs all subscriptions given content and notifies users about new releases.
     * @param {Number} content - Content ID.
     * @param {Boolean} type - Content type.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    notifySubscriptions(content, type) {
        return _model.Subscription.find({ content: content, notify: true, type: type }).then(data => {
            // notifiy all users
            return Promise.all(data.map(element => element.user)).then(users => (0, _bot.notifyRelease)(content, users)).then(true).catch(error => {
                throw error;
            });
        }).catch(error => {
            console.log('[Error] DB notifySubscriptions:', error);
            return false;
        });
    }

    /**
     * This  function  seeks the running animes/mangas -- the last one not yet available -- and notify the user upon new
     * releases.
     */
    runNotify() {
        console.log('Notify starting up.');

        // Notify only animes for now only since mangas don't have this feature implemented yet.
        const type = true;

        // Run each half hour
        const process = _nodeSchedule2.default.scheduleJob('*/30 * * * *', () => {
            const serverTime = new Date(Date.now());
            console.log(`[${serverTime.toString()}] Running notifications...`);

            // Verifies all content that time of release is less than actual server time
            _model.Notifications.find({ type: type }).where('time').lt(serverTime).then(content => {
                // Notify only if there's any content to be notified.
                if (0 < content.length) {
                    content.forEach(element => {
                        // Notify all users upon new release
                        this.notifySubscriptions(element._id, type);
                        // Update relase time
                        (0, _search.searchAnimeRelaseDate)(element._id).then(time => {
                            // update to next release
                            if (time) return element.update({ time: time }).then(counter => {
                                return counter ? true : false;
                            }).catch(error => {
                                throw error;
                            });
                            // or remove it in case it's finished -- or cancelled
                            else return element.remove().then(counter => {
                                    return counter ? true : false;
                                }).catch(error => {
                                    throw error;
                                });
                        }).catch(error => {
                            throw error;
                        });
                    });
                } else console.log('No content available in notifications.');
            }).catch(error => {
                console.log('[Error] runNotify:', error);
                process.cancel();
            });
        });
    }
}
exports.default = DB;