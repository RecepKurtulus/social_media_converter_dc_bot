const axios = require('axios')
const uniqueFilename = require('unique-filename')
const fs = require('fs')
const path = require('path')
module.exports.downloadTikTokVideo = async (videoUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      const startIndex = 0
      const endIndex = 19
      const videoId = videoUrl.split('/')[5].substring(startIndex, endIndex)
      console.log(videoId)
      const downloadUrl =
        'https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=' +
        videoId
      console.log(downloadUrl)
      const response = await axios.get(downloadUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          Referer: 'https://www.tiktok.com/',
        },
        responseType: 'json',
      })
      const embedVideoUrl =
        response.data.aweme_list[0].video.play_addr.url_list[0]
      console.log(embedVideoUrl)
      const downloadFolder = path.join(require('os').homedir(), 'Downloads')
      const filePath = `${uniqueFilename(downloadFolder, 'doppel')}.mp4`
      //const filePath = `${downloadFolder}/sasa.mp4`

      const videoStream = await axios.get(embedVideoUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          Referer: 'https://www.tiktok.com/',
        },
        responseType: 'stream',
      })
      // returns something like: '/tmp/my-test-51a7b48d'
      const writeStream = fs.createWriteStream(filePath)
      videoStream.data.pipe(writeStream)

      //videoStream.data.pipe(fs.createWriteStream(filePath));
      console.log(filePath)
      writeStream.on('finish', async () => {
        resolve(filePath)
      })
    } catch (error) {
      console.error('Hata:', error)
      reject(error)
    }
  })
}
