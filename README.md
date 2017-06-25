# ANILIST bot

<img src="https://raw.githubusercontent.com/Fazendaaa/Anilist-bot/master/images/PNG/circled_logo.png" alt="Anilist-bot logo" align="right" />

This is a [Telgram](https://telegram.org) search bot in [Anilist](https://anilist.co) database. This is an UNOFFICIAL bot.

## Deployment

This bot is up and running in [Heroku](https://www.heroku.com/home)

## Built With

* [Node-js](https://nodejs.org/en/) - Running application;
* [Telegraf](https://github.com/telegraf/telegraf) - Telegram wrapper;
* [nani](https://github.com/sotojuan/nani) - Anilist wrapper;
* [dotenv](https://github.com/motdotla/dotenv) - Used to read enviroment variables;
* [node-schedule](https://github.com/node-schedule/node-schedule) - Schedule notifications;
* [mongoose](http://mongoosejs.com) - Bot's database;
* [moment](https://momentjs.com) - Convert's time formats;
* [Humanize Duration](https://github.com/EvanHahn/HumanizeDuration.js) - Set countdown;
* [Node Google Timezone](https://www.npmjs.com/package/node-google-timezone) - Search for user timezone given his location;
* [City Timezones](https://www.npmjs.com/package/city-timezones) - Search for user timezone given city name.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/Fazendaaa/Anilist-bot/blob/master/CONTRIBUTING.md) for details on code of conduct, and the process for submitting pull requests to us.

## Versioning

It is used [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Fazendaaa/Anilist-bot/tags). 

## Authors

* **Farm** - *Initial work* - [Fazendaaa](https://github.com/Fazendaaa)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/Fazendaaa/Anilist-bot/blob/master/LICENSE) file for details

## Acknowledgments

Huge thanks to [Juan Soto](https://github.com/sotojuan) and the awesome and easy to use Anilist wrapper that he made it. And the folks behind Telegraf for an awsome and well documented API. Without these kinda of people and their works it would be harder to make this bot.

## Fixed bugs

**V 2.3**:
* User now recive notification when it's the releases season finale episode.

## Improvements

**V 2.3**
* New UI;
* Added option to user set specifc hour to recive all notificatons about episodes releases;
* Added notifications in countdown for season finale;
* Removing some info in notify upon episode release and watchlist -- was too much oversharing;
* Removed commands: /notifications and /source -- content is available in menu from now on;
* Remove reply to message in watchlist and readlist -- now user has buttons to do the same.

**V 2.4**
* Added pagination in inline mode;
* Handle group/supergroups;
* Changing user keyboard.

## TODO

* Integration with wit.ia;
* Login with your Anilist account;
* "How much time have I spent watching animes?" -- aka: anime calculator;
* Give option to rate an episode and comment about it;
* Give option to write a review about an anime/manga;
* Add language options;
* Give the user the option to set layout display among title options like: EN, JP and Romanji;
* 'Like' system;
* System to give user content recomendations.
