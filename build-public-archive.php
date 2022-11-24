<?php
/*
	Idea:
	- Take data/tweets.js
	- Break it into smaller JS bundles broken down by yyyy/mm.js
	- Rebuild the JS/UI to look as-is, but to lazy-load more content as you scroll

*/
ini_set('memory_limit', '500M');
date_default_timezone_set("America/Los_Angeles");

if (!file_exists("./Your archive.html")) {
	print "<p>Expected to find <i>Your archive.html</i> in same directory as this script. It was not found. Cannot continue.</p>";
	exit;
}

$messages = array("<h3>Running...</h3>");
$public_dir = "./public";

if (!file_exists( $public_dir )) {
	mkdir( $public_dir, 0755, true);
	$messages[] = "Creating <i>public</i> directory";
}

$content  = file_get_contents('./data/tweets.js');
$json_str = str_replace('window.YTD.tweets.part0 = ', '', $content);
$tweets   = json_decode( $json_str, true );

$data = array();
$limit = 0;

foreach ($tweets as $tweet) {

	$tweet = $tweet['tweet'];

	$created_at = new DateTime( $tweet['created_at'] );
	$year  = $created_at->format('Y');
	$month = $created_at->format('m');

	if (!isset($data[$year])) {
		$data[$year] = array();
	}
	if (!isset($data[$year][$month])) {
		$data[$year][$month] = array();
	}

	$data[$year][$month][] = $tweet;
}

$data_index = array(
	'profile' => array(),
	'map'     => array(),
	'sources' => array(),
);

$flag = JSON_PRETTY_PRINT;
// $flag = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK;

foreach ($data as $year => $year_val) {

	$messages[] = "Processing tweets for $year";

	$dir = "$public_dir/tweets/$year";
	if (!file_exists( $dir )) {
		mkdir( $dir, 0755, true);
	}
	if (!isset($data_index['sources'][$year])) {
		$data_index['map'][$year] = array();
	}

	foreach ($year_val as $month => $month_val) {
		$file = $dir . "/$month-tweets.json";
		file_put_contents( $file, json_encode( $month_val, $flag ) );
		$data_index['sources'][] = "tweets/$year/$month-tweets.json";
		if (!in_array($month, $data_index['map'][$year])) {
			$data_index['map'][$year][] = (string) $month;
		}
	}
}
asort($data_index['sources']);

$messages[] = "Consolidating account information";

/* Profile Information */

$profile  = file_get_contents('./data/profile.js');
$json_str = str_replace('window.YTD.profile.part0 = ', '', $profile);
$profile  = json_decode( $json_str, true );

$data_index['profile'] = $profile[0]['profile'];

$account  = file_get_contents('./data/account.js');
$json_str = str_replace('window.YTD.account.part0 = ', '', $account);
$account  = json_decode( $json_str, true );

/* Account Information - consildate with profile data */

if (!empty($account[0])) {
	$accountId = $account[0]['account']['accountId'];
	$displayName = $account[0]['account']['accountDisplayName'];
	$data_index['profile']['username'] = $account[0]['account']['username'];
	$data_index['profile']['accountId'] = $accountId;
	$data_index['profile']['createdAt'] = $account[0]['account']['createdAt'];
	$data_index['profile']['displayName'] = $displayName;
	$messages[] = "Found account information for $displayName";
} else {
	$messages[] = "Error: Could not locate account data";
}

/* Copy over media files (this could be very big... */

// $media_dir = "./data/tweets_media";
// if (file_exists($media_dir)) {
//     $messages[] = "Found media directory, copying...";
// 	if (!copy($media_dir, "$assets_dir/media_dir")) {
// 		$messages[] = "Error: Unable to copy  media directory to new location";
// 	} else {
// 		$messages[] = "Success";
// 	}
// } else {
// 	$messages[] = "Error: Could not copy media directory. ($media_dir)";
// }

/* Copy Header and Avatar images at a new location */

$assets_dir = "$public_dir/assets";

$bits = explode("/", $data_index['profile']['avatarMediaUrl']);
$profile_img_file = "./data/profile_media/$accountId-" . end($bits);
$data_index['profile']['avatarMediaUrl'] = '';

if (file_exists($profile_img_file)) {
    $messages[] = "Found profile image, copying to new home";
	if (!copy($profile_img_file, "$assets_dir/profile.png")) {
		$messages[] = "Error: Unable to copy profile image to new location";
	} else {
		$data_index['profile']['avatarMediaUrl'] = "profile.png";
	}
} else {
	$messages[] = "Error: Did not find profile image. Manual update required. ($profile_img_file)";
}

$bits = explode("/", $data_index['profile']['headerMediaUrl']);
$header_img_file = "./data/profile_media/$accountId-" . end($bits) . ".jpg";
$data_index['profile']['headerMediaUrl'] = '';

if (file_exists($header_img_file)) {
    $messages[] = "Found header image, copying to new home";
	if (!copy($header_img_file, "$assets_dir/header.jpg")) {
		$messages[] = "Error: Unable to copy header image to new location";
	} else {
		$data_index['profile']['headerMediaUrl'] = "header.jpg";
	}
} else {
	$messages[] = "Error: Did not find header image. Manual update required. ($header_img_file)";
}

/* Save */
file_put_contents( "$public_dir/index.json", json_encode( $data_index, $flag ) );

$messages[] = "Updating index.json";
$messages[] = "<h3>It's over</h3>";

print implode("<br>\n", $messages);
