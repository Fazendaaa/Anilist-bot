'use strict';

import schedule from 'node-schedule';

import moment from 'moment-timezone';

import {
    mongoose,
    User,
    Subscription,
    Notifications,
    notifyUser
} from './model';

import {
    verifyNumbers,
    dotenv,
    invalid,
    serverError,
    empty
} from './utils';

import {
    searchAnimeRelaseDate
} from './search';

import {
    notifyRelease,
    notifyUserReleases
} from './bot';

/**
 * This function set a next next day for updates.
 * @param {Date} time - Actual time.
 * @param {String} timezone - User's timezone.
 * @returns {Date} new time to be setted.
 */
const setNextDay = (time, timezone) => {
    let newTime = moment(time).tz(timezone).add(1, 'day');

    // Why?  Looks like there's no need to do this -- 'quite' right. But, if the bot is set down when it's running tests
    // after this could create a few inconsistencies if not checked.
    if(moment().add(1, 'day') < newTime)
        newTime = newTime.subtract(1, 'day');
        
    return newTime.format();
}

/**
 * This function set time for updates.
 * @param {Date} time - Updated time.
 * @returns {Date} new time to be setted.
 */
const setDay = time => {
    let newTime = time;

    // Why?  If  any  server error occurs consistency must always be priorty. This is just to ensure that if user change
    // his time for updates won't be setted for two days from now or anything like that.
    if(moment().add(1, 'day') < newTime)
        newTime = newTime.subtract(1, 'day');
        
    return newTime.format();
}

/**
 * This is the bot's database and all methods related to it.
 */
export default class DB {
    constructor() {
        mongoose.connect(process.env.MONGODB_URI);
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', () => console.log('DB connected'));
        // Opitions to add a new entry case it doesn't already exist
        this.options = {upsert: true, new: true, setDefaultsOnInsert: true};
    }

    /**
     * This functions adds an anime to notitications system so, that way, user can be notified upon new episodes.
     * @param {Number} _id - Anime ID.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addAnimeNotifications(_id) {
        return searchAnimeRelaseDate(_id).then(time => {
            // For  now  only  add  animes  that  are currently airing since those are the only to release new episodes.
            // Wheter  or  not  an  anime is coming out from an hiatus, only when a new user added it to his subscpriton
            // list  it's going to enable notifications. The bright side is that when this occours all user subscrptions
            // to  this  anime  will start to be notified as weel. If added those animes whom aren't airing the database
            // will grow much more and the need for space will grow as well -- tl;dr: I want to save DB storage money.
            if(time)
                return Notifications.findOneAndUpdate({_id, type: true, time}, {}, this.options).then(anime => {
                    return anime.save().then(data => true).catch(error => {throw error;});
                }).catch(error => {throw error;});
            else
                return false;
        }).catch(error => {
            console.log('[Error] DB addAnimeNotifications:', error);
            return serverError;
        });
    }

    /**
     * This function is a mock up only. Since manga notifications are not yet available.
     * @param {Number} manga_id - Anime ID.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addMangaNotifications(manga_id) {
        
    }

    /**
     * This functions adds an content to notitications system so, that way, user can be notified upon new releases.
     * @param {Boolean} type - Content type.
     * @param {Number} type_id - Content ID.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addNotifications(type, type_id) {
        return (type) ? this.addAnimeNotifications(type_id) : this.addMangaNotifications(type_id);
    }

    /**
     * This function adds a new user, case there's none and verifies wheter he want's to be notified upon new releases.
     * @param {Number} _id - User ID.
     * @param {Mongoose's JSON} subscription - New subscription.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    addUser(_id, subscription) {
        return User.findByIdAndUpdate({_id}, {}, this.options).then(user => {
            // In case that the user doesn't want to be notified
            if(!user.notify)
                subscription.notify = false;

            return subscription.save().then(subs => {
                return user.save().then(data => true).catch(error => {throw error;});
            }).catch(error => {throw error;});
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
        const type = ('anime' == kind) ? true : false;
        // See if user is already subscribed to this content
        return Subscription.findOne({user, content, type}).then(subscribed => {
            if(!subscribed) {
                const subscription = new Subscription;
                subscription.user = user;
                subscription.content = content;
                subscription.type = type;

                return this.addUser(user, subscription).then(added => {
                    // So far only add notifications to anime type.
                    if(added && type)
                        this.addNotifications(type, content);
                    return added;
                }).catch(error => {throw error;});
            }
            // User already subscribed to this content
            else
                return false;
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
        const type = ('anime' == kind) ? true : false;

        return Subscription.findOne({user, content, type}).remove().then(counter => {
            return (counter) ? true : false;
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
        return Subscription.find({user, type}).then(subscription => {
            if(0 < subscription.length)
                return subscription.map(element => {
                    return {
                        content: element.content,
                        notify: element.notify
                    };
                });
            else
                return undefined;
        }).catch(error => {
            console.log(`[Error] DB fetchAll${(type) ? 'Anime' : 'Manga'}:`, error);
            return undefined;
        });
    }

    /**
     * Fetch specifc content of given type related to user's subscription.
     * @param {Number} user - User ID.
     * @param {Boolean} type - Type of content.
     * @returns {JSON} Content fetched.
     */
    fetchOne(user, content, type) {
        return Subscription.findOne({user, content, type}).then(subscription => {
            if(subscription)
                return {
                    content: subscription.content,
                    notify: subscription.notify
                };
            else
                return undefined;
        }).catch(error => {
            console.log(`[Error] DB fetchOne${(type) ? 'Anime' : 'Manga'}:`, error);
            return undefined;
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
        return User.findOneAndUpdate({_id}, {}, this.options).then(user => {
            return user.save().then(data => data).catch(error => {throw error;});
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
        return Subscription.update({user}, {notify}, {multi: true}).then(counter => {
            return (counter) ? true : false;
        }).catch(error => {
            console.log('[Error] DB toggleAllSubscriptions:', error)
            return {Error: serverError};
        });
    }

    /**
     * This function toggle user's notifications.
     * @param {Number} _id - User ID.
     * @returns {Boolean} New user notitifcation status.
     */
    toggleNotifications(_id) {
        return User.findOneAndUpdate({_id}, {}, this.options).then(user => {
            // Toggle notifications
            user.notify = !user.notify;

            return user.save().then(data => {
                this.toggleAllSubscriptions(_id, data.notify);
                return data.notify;
            }).catch(error => {throw error;});
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
        return Subscription.findOne({user, content, type: true}).then(subscription => {
            subscription.notify = !subscription.notify;
            return subscription.save().then(data => data.notify).catch(error => {throw error;});
        }).catch(error => {
            console.log('[Error] DB toggleAnime:', error);
            return undefined;
        });
    }

    /**
     * Sets time in case user wants to be notified in specific hour of the day.
     * @param {Number} _id - User's ID.
     * @param {String} hour - Hour to be notified upon new releases.
     * @param {String} timezone - User's timezone.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    setTime(_id, hour, timezone) {
        return User.findOneAndUpdate({_id}, {}, this.options).then(user => {
            // Set time for updates given user timezone.
            user.timezone = timezone;
            user.time = setDay(moment().tz(user.timezone).hours(hour).minutes(0).seconds(0).milliseconds(0));
            return user.save().then(data => true).catch(error => {throw error;});
        }).catch(error => {
            console.log('[Error] DB setTime:', error);
            return undefined;
        });
    }

    /**
     * This function verifies wether or not user wants to be notified at specific time.
     * @param {Number} _id - User's id.
     * @returns {String} User's time for notifications.
     */
    getUserTime(_id) {
        return User.findOne({_id}).then(user => {
            if(user && user.time && user.timezone)
                return {time: user.time, timezone: user.timezone};
            else
                return undefined;
        }).catch(error => {
            console.log('[Error] DB getUserTime:', error);
            return undefined;
        });
    }

    /**
     * Removes time for notifications.
     * @param {Number} _id - User's ID.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    removeTime(_id) {
        return User.findOneAndUpdate({_id}, {}, this.options).then(user => {
            if(user.time) {
                user.time = undefined;
                user.timezone = undefined;
                return user.save().then(true).catch(error => {throw error;});
            }
            // User already removed his time for notifications
            else
                return undefined;
        }).catch(error => {
            console.log('[Error] DB removeTime:', error);
            return undefined;
        });
    }

    /**
     * 
     * @param {Number} user - User's ID.
     * @param {Number} content - Content's ID.
     * @param {Boolean} type - Type of content.
     * @returns {Subscription} User's subscription of the content.
     */
    fetchSubscription(user, content, type) {
        return Subscription.findOne({user, content, type}).catch(error => {
            console.log(`[Error] DB fetchSubscription${(type) ? 'Anime' : 'Manga'}:`, error);
            return {Error: serverError};
        });
    }

    /**
     * Sets user notification to run at notification time.
     * @param {Number} content - Content's id.
     * @param {Boolean} type - Content type.
     * @param {Object[{user, time}]} info - User's id plus the time that they want to be notified.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    notifyLater(content, type, info) {
        if(info.length > 0) {
            info.forEach(element => {
                return this.fetchSubscription(element.user, content, type).then(subscription => {
                    // Save subscription reference so, that way, user can be notfied about it.
                    if(subscription)
                        return notifyUser.findOneAndUpdate({user: element.user, subscription}, {}, this.options)
                        .then(true).catch(error => {throw error;});
                    else
                        return false;
                }).catch(error => {
                    console.log('[Error] DB notifyUpdate:', error);
                    return undefined;
                });
            });
        }

        else
            return Promise.resolve(false);
    }

    /**
     * This function fetchs all subscriptions given content and notifies users about new releases.
     * @param {Number} content - Content ID.
     * @param {Boolean} type - Content type.
     * @returns {Boolean} Wheter or not the operations was sucessfully.
     */
    notifySubscriptions(content, type) {
        return Subscription.find({content, notify: true, type}).then(data => {
            return Promise.all(data.map(element => element.user)).then(users => {
                const later = [];

                Promise.all(users.map(user => {
                    return this.getUserTime(user).then(response => {
                        // In case user doesn't want to be notified later then release.
                        if(!response)
                            return user;
                        else {
                            later.push({user, time: response.time});
                            return undefined;
                        }
                    })
                }))
                // Remove undefined values.
                .then(data => data.filter(element => element))
                .then(notifyNow => {
                    // notifiy user's now.
                    notifyRelease(content, notifyNow);
                    // notifiy user's later.
                    this.notifyLater(content, type, later);
                }).then(true).catch(error => {throw error;});

            }).then(true).catch(error => {throw error;});
        }).catch(error => {
            console.log('[Error] DB notifySubscriptions:', error);
            return false;
        });
    }

    /**
     * This will run and notify users about the daily releases.
     * @param {Object[JSON]} users - User's to be notified in setted time.
     * @returns {Object[JSON]} Updated users.
     */
    notifyInTime(users) {
        // Find all the content the were released between last update and this one.
        users.forEach(user => { notifyUser.find({user: user._id}).then(notifications => {
            if(0 < notifications.length)
                Promise.all(notifications.map(element => {
                    const subscpritonID = element.subscription;

                    // Remove  user  notifications so memory could be freed since won't be needed it at least user has a
                    // new notifications.
                    // So  why  removing  it?  User could be only seeing a few animes/mangas per week, that way would be
                    // storing much more space all week for a notification the runs only once in a week.
                    element.remove().catch(error => {throw error;});

                    return Subscription.findById(subscpritonID).then(subscription => {
                        // Why  checking  it  again?  Because user could disabled notification after the release or even
                        // removed  the  subscription.  Then  saving  it  so  user  recives  only one message instead of
                        // multiples -- like a spam.
                        if(subscription && subscription.notify)
                            return subscription.content;
                    }).catch(error => {throw error;});
                })).then(releases => {
                    // Notifiy user about all content releases that were released.
                    notifyUserReleases(user._id, releases);
                });

            else
                console.log('No notifications for this user');
        }).catch(error => {
            console.log('[Error] DB notifyInTime', error);
            return error;
        });});
    }

    /**
     * This  function  seeks the running animes/mangas -- the last one not yet available -- and notify the user upon new
     * releases.
     */
    runNotify() {
        // Notify only animes for now only since mangas don't have this feature implemented yet.
        const type = true;
    
        console.log('Notify starting up.');

        // Runs each half hour -- since most of animes are released in hours like 12:00 or 12:30.
        const process = schedule.scheduleJob('00,30 * * * *', () => {
            const serverTime = new Date(Date.now());
            console.log(`[${serverTime.toString()}] Running content notifications.`);

            // Verifies all content that time of release is less or equal to actual server time - meaning tha episode is
            // already released.
            Notifications.find({type}).where('time').lte(serverTime).then(content => {
                // Notify only if there's any content to be notified.
                if(0 < content.length) {
                    content.forEach(element => {
                        // Notify all users upon new releases.
                        this.notifySubscriptions(element._id, type);
                        // Update relase time
                        searchAnimeRelaseDate(element._id).then(time => {
                            // update to next release.
                            if(time)
                                return element.update({time}).then(counter => {
                                    return (counter) ? true : false;
                                }).catch(error => {throw error;});
                            // or remove it in case it's finished -- or cancelled.
                            else
                                return element.remove().then(counter => {
                                    return (counter) ? true : false;
                                }).catch(error => {throw error;});
                        }).catch(error => {throw error;});
                    });
                }
                else
                    console.log('No available notifications in content.');
            }).catch(error => {
                console.log('[Error] runNotify content:', error);
                process.cancel();
            });
        });

        // Runs each hour.
        const later = schedule.scheduleJob('00 * * * *', () => {
            const laterTime = new Date(Date.now());
            console.log(`[${laterTime.toString()}] Running user notifications.`);
            
            // Verifies  only  the  users  whom  seted  this hour to be notified. Why comparing with a new date? Because
            // laterTime won't match because of miliseconds offset.
            User.find({notify: true}).where('time').equals(moment(laterTime).seconds(0).milliseconds(0).toISOString())
            .then(users => {
                if(0 < users.length) {
                    // All user that have notifications to this time will be notified.
                    this.notifyInTime(users);

                    // Why  updates all users that have this time for notifications even those who weren't notified now?
                    // If  those users who weren't notified today have notifications for tomorrow they won't be notified
                    // because they time would not match with the server, even thought they have notifications -- that's
                    // why the need to update it.
                    users.forEach(user => {
                        user.time = setNextDay(user.time, user.timezone);
                        user.save().catch(error => {throw error;});
                    });
                }

                else
                    console.log('No users to be notified.');
            }).catch(error => {
                console.log('[Error] runNotify user:', error);
                later.cancel();
            });
        });
    }
}
