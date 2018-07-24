# README #

This script grabs information from a specific profile page on Kickstarter.com.
New updates, contributor comments, and project announcements are forwarded to a community Discord (https://discordapp.com/) server dedicated to the company whose profile is being tracked.

Main.js makes takes two arguments.
  ..* w: 'webhook' A Discord server/channel webhook URL. Any messages sent using the discord.js module will use this URL to send POST requests.
  ..* a: 'address' The URL addres of the Kickstarter profile to be looked at. This should be a link to the profile itself, not a project page.

The Main.js script is responsible for making all calls to the discord.js and kickstarter.js modules. I plan on re-organizing the project so that the entire module can be imported, and then individual actions taken instead of only being able to pass two URLS via command-line arguments.