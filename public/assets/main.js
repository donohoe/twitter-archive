var app = {
	init: function(){
		console.log('Yo');
		this.index = 0;
		this.sources = {};
		fetch('./index.json')
		.then((response) => response.json())
		.then((data) => this.run(data));
	},

	run: function(data){
		this.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ];
		this.data = data;
		this.sources = data.sources;
		this.updateProfile();
		this.load();
		this.addEvents();
	},

	addEvents: function(){
		var target = document.querySelector('#footer');
		var observer = new IntersectionObserver(this.handleIntersection);
		observer.observe(target);
	},

	handleIntersection: function (entries) {
		entries.map((entry) => {
			if (entry.isIntersecting) {
				app.load();
			}
		});
	},

	updateProfile: function(){
		var profile = this.data.profile;
		this.username = profile.username;
		this.profile_img = 'assets/' + profile.avatarMediaUrl;
		var profileEl = document.getElementById('profile');
		profileEl.querySelector('h2').innerText = profile.displayName;
		profileEl.querySelector('span.bio').innerText = profile.description.bio;
		profileEl.querySelector('#profile_location').innerText = profile.description.location;
	},

	load: function(){
		if (this.index >= this.sources.length) {
			document.querySelector('#footer span').innerText = 'The End.';
			return;
		}
		var file = '' + this.sources[ this.index ];
		fetch(file )
		.then((response) => response.json())
		.then((data) => this.render(data))
		.then(this.index++);
	},

	render: function(tweets){
		var html = '';
		tweets.forEach(async (tweet) => {
			html += this.renderTweet(tweet);
		});

		var el = document.createElement('div');
		el.id = 'tweet-group-' + this.index;
		el.setAttribute('data-source', this.sources[ this.index ]);
		document.getElementById('content').appendChild(el);
		el.innerHTML = html;
	},

	renderTweet: function(tweet){
		var d = new Date( tweet['created_at'] );
		var dateLabel = this.months[(d.getMonth())] + ", " + d.getDate() + ", " + d.getFullYear(); /* Nov 3, 2022 */
		var id = tweet['id_str'];
		var full_text = this.getFullText( tweet );

		var html = [
			'<div class="row">',
				'<div class="item css-1dbjc4n r-uvzvve r-qklmqi r-1j3t67a r-1w50u8q">',
					'<div class="ytd-tweet Tweet Tweet--timeline Tweet--web" dir="ltr">',
						'<div class="Tweet-avatarContainer">',
							'<img alt="" class="Tweet-avatar" src="./' + this.profile_img + '" width="48" height="48">',
						'</div>',
						'<div class="Tweet-body">',
							'<div class="Tweet-header">',
								'<div class="Tweet-userData">',
									'<a class="Tweet-userLink" href="https://twitter.com/' + this.username + '" rel="noopener noreferrer" target="_blank"><span class="Tweet-name">Michael Donohoe</span>  <span class="Tweet-screenName">@donohoe</span></a> <span class="Tweet-timeLabel"> <a class="Tweet-timestamp" href="https://twitter.com/donohoe/status/' + id + '" rel="noopener noreferrer" target="_blank">' + dateLabel + '</a></span>',
								'</div>',
							'</div>',
							'<div class="Tweet-text ltr" dir="ltr">' + full_text + '</div>',
						'</div>',
						'<div class="Tweet-footer">',
							'<div class="Tweet-actions Tweet-actions--readOnly">',
								'<button aria-label="Retweet" class="Tweet-action Tweet-action--retweet" disabled="" type="button">',
									'<span class="Icon Icon--retweet"></span> <span class="Tweet-actionCount">' + tweet['retweet_count'] + '</span>',
								'</button>',
								'<button aria-label="Like" class="Tweet-action Tweet-action--like" disabled="" type="button">',
									'<span class="Icon Icon--heart"></span> <span class="Tweet-actionCount">' + tweet['favorite_count'] + '</span>',
								'</button>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
			'</div>'
		].join('');
		return html;
	},

	getFullText: function(tweet){
		var text = tweet['full_text'];

		if (tweet['entities']['urls']) {
			tweet['entities']['urls'].forEach((entity) => {
				var url = entity['url'];
				if (text.indexOf(url) !== -1) {
					text = text.replace(url, '<a href="' + entity['expanded_url'] +'" target="_blank">' + entity['display_url'] + '</a>');
				}
			});
		}

		if (tweet['entities']['hashtags']) {
			tweet['entities']['hashtags'].forEach((entity) => {
				var hashtag = '#' + entity['text'];
				if (text.indexOf(hashtag) !== -1) {
					text = text.replace(hashtag, '<a href="">' + hashtag +'</a>');
				}
			});
		}

		if (tweet['entities']['media']) {
			tweet['entities']['media'].forEach((entity) => {
				var url = entity['url'];
				if (text.indexOf(url) !== -1) {

					var type = 'photo';
					if (entity['media_url_https'].indexOf('tweet_video_thumb') !== -1) {
						type = 'video';
					}

					if (type === 'photo') {
						text = this.getPhoto(tweet, entity);
					}
					if (type === 'video') {
						text = this.getVideo(tweet, entity);
					}
				}
			});
		}

		if (tweet['entities']['user_mentions']) {
			tweet['entities']['user_mentions'].forEach((um) => {
				var screen_name = '@' + um['screen_name'];
				if (text.indexOf(screen_name) !== -1) {
					var link = '<a href="https://twtter.com/' + um['screen_name'] +'" title="' + um['name'] +'" target="_blank">' + screen_name + '</a>';
					text = text.replace(screen_name, link);
				}
			});
		}

		return text;
	},

	getPhoto: function(tweet, entity){
		var url = entity['url'];
		var image_file = tweet['id_str'] + '-' + entity['media_url_https'].split("/").pop();
		var image_path = '../data/tweets_media/' + image_file;
		var media = '<div class="Tweet-photoContainer"><img src="' + image_path + '"></div>';
		var text = tweet['full_text'].replace(url, media);
		console.log('image_file', image_file );
		return text;
	},

	getVideo: function(tweet, entity){
		var url = entity['url'];
		var image_file = tweet['id_str'] + '-' + entity['media_url_https'].split("/").pop().replace('.jpg', '.mp4');
		var image_path = '../data/tweets_media/' + image_file;
		var media = [
			'<div class="Tweet-videoContainer">',
				'<video controls loop>',
					'<source src = "' + image_path + '" type = "video/mp4">',
				'</video>',
			'</div>'
		].join('');
		var text = tweet['full_text'].replace(url, media);
		console.log('video_file', image_file );
		return text;
	}
};

app.init();
