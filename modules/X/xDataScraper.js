const axios = require('axios')
const uniqueFilename = require('unique-filename')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

module.exports.fetchDataFromX = async (videoUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      //Postun linki
      const videoId = videoUrl.match(/\/status\/(\d+)/)[1]
      console.log('Post Id Alindi ' + videoId)
      const getEndPoint = `https://twitter.com/i/api/graphql/asrOABj-cTf32kZWtmVGtw/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${videoId}%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Afalse%7D`
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        accept: '*/*',
        'accept-language': 'tr-TR,tr;q=0.5',
        authorization:
          process.env.AUTHORIZATION,
        'content-type': 'application/json',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Brave";v="120"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'x-client-transaction-id':
          process.env.X_CLIENT_TRANSACTION_ID,
        'x-csrf-token':
          process.env.X_CSRF_TOKEN,
        'x-twitter-active-user': 'yes',
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-client-language': 'en',
        cookie:
          process.env.COOKIE,
        Referer: 'https://twitter.com',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      }
      const response = await axios.get(getEndPoint, {
        headers: headers,
        responseType: 'json',
      })
      //All variants for video
      const query = response.data.data.threaded_conversation_with_injections_v2.instructions[0].entries.find(
        (entry) => entry.entryId == `tweet-${videoId}`,
      ).content.itemContent.tweet_results.result.legacy.entities.media[0]
        .video_info.variants
      //Highest bitrate
      let embedVideoUrl = ''
      let biggestBitRate = 0
      await query.forEach((element) => {
        if (element.bitrate > biggestBitRate) {
          biggestBitRate = element.bitrate
          embedVideoUrl = element.url
        }
        console.log(element)
      })
      console.log(embedVideoUrl)
      const downloadFolder = path.resolve('./Downloads')
      const filePath = `${uniqueFilename(downloadFolder, 'doppel')}.mp4`
      const videoStream = await axios.get(embedVideoUrl, {
        headers: headers,
        responseType: 'stream',
      })

      //Writing to file
      const writeStream = fs.createWriteStream(filePath)
      await videoStream.data.pipe(writeStream)
      writeStream.on('finish', async () => {
        console.log('Data scraper return değeri: ' + filePath)
        resolve(filePath)
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}
