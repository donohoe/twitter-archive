# Twitter Archive

WHen you download your Twitter archive you can't easily host it as it contains a lot of private information, from DMs to personal information. The goal os this project is to create a light, fast, and public version of your Twitter archive.

## Getting started

There are a number of assumptions made in this gudie.

- This assumes you have already requested and ldoaladed a ZIP file of your Twitter archive form the service. 
  - In my case the zip file as 1.8GB in size.
- You have PHP installed and know how to run scripts.
  - PHP has its own development server, you can use that. https://www.php.net/manual/en/features.commandline.webserver.php

- Download or checkout this reposirory.
- Copy the contents of your Twitter archive into ths same folder. The filesystem should look a little like this:
  - assets
  - data
  - Your archive.html
  - build-public-archive.php
  - public
- Run the PHP script...
  - There are a few ways to do this. 
  - If you have PHP installed, using Terminal, you can navigate to the folder
  - Enter `php -S localhost:5050`
  - Run the script at http://localhost:5050/build-public-archive.php
- Copy (or move) `data/tweets_media` to `public/tweets_media`
- Copy (or move) `assets/fonts` to `public/assets/fonts`

## Upload

Everything within the `public` folder is intended to be made public. Depending on the amount of images and videos this could take a awhile. Its worth updating any folder or file permissions before uploading. `tweets_media` folder should be `644`, and the files `644`.

Do not upload the 'build-public-archive.php' script. Delete it.

## Known Issues

- Forgot to copy over icon fonts as part of it.
- Frontend rendering only supports 1 image or video in tweets.
- Terrible instructions.

## Future Changes

- Allow links to individiual tweets via URL hash
- Explore adding a simple search/filter
- Non-PHP versions of build script (no reason it must be PHP)
- Expand tweet layout formats
- Better lazy-loading

