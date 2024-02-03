const axios = require('axios')
const cheerio = require('cheerio')
const uniqueFilename = require('unique-filename')
const fs = require('fs')
const path = require('path')
const headers={
  'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        Referer: 'https://www.tiktok.com/',
}
module.exports.downloadTikTokVideo = async (videoUrl) => {
  return new Promise(async (resolve, reject) => {
    
    console.log(videoUrl)
    try {
      //For mobile video sharing
      if (videoUrl.includes('https://vm.tiktok.com')) {
        console.log('Mobil link is downloading')
        const videoReqToHtml = await axios.get(videoUrl, {
          headers:headers,
          responseType: 'json',
        })


        const htmlContent = videoReqToHtml.data
        const $ = cheerio.load(htmlContent)

        // __UNIVERSAL_DATA_FOR_REHYDRATION__ script tag
        const scriptTag = $('script#__UNIVERSAL_DATA_FOR_REHYDRATION__')

        // Get data from script tag
        const jsonData = JSON.parse(scriptTag.html())


        const videoWebUrl = jsonData['__DEFAULT_SCOPE__']['seo.abtest'].canonical
        console.log(videoWebUrl);
        const filePath=await videoDownloader(videoWebUrl);
        resolve (filePath);
        
      }
      if (videoUrl.includes('https://www.tiktok.com/')) {
        const filePath=await videoDownloader(videoUrl);
        resolve (filePath);
      }
    } catch (error) {
      console.error('Hata:', error)
      reject(error)
    }
  })
}

const videoUrlShorter = async (url) => {
  const startIndex = 0
  const endIndex = 19
  const videoId = url.split('/')[5].substring(startIndex, endIndex)
  return videoId
}

const videoDownloader = async(videoUrl)=>{
  return new Promise(async (resolve, reject) => {
    try {

      const videoId = await videoUrlShorter(videoUrl)
    console.log(videoId)
    const downloadUrl =
      'https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=' +
      videoId
    console.log(downloadUrl)
    const response = await axios.get(downloadUrl, {
      headers: headers,
      responseType: 'json',
    })
    const embedVideoUrl = response.data.aweme_list[0].video.play_addr.url_list[0]
    console.log(embedVideoUrl)
    const downloadFolder = path.resolve('./Downloads')
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }
    //Unique name generator for files
    const filePath = `${uniqueFilename(downloadFolder, 'doppel')}.mp4`

    const videoStream = await axios.get(embedVideoUrl, {
      headers: headers,
      responseType: 'stream',
    })
    // returns something like: '/tmp/my-test-51a7b48d'
    const writeStream =  fs.createWriteStream(filePath)
    await videoStream.data.pipe(writeStream)
    
    //videoStream.data.pipe(fs.createWriteStream(filePath));
    
      writeStream.on('finish', async () => {
      console.log("Data scraper retrun değeri : "+filePath)
      resolve(filePath)
    })
  
      
    } catch (error) {
      reject(error);
      console.log(error);
    }
  })
  

}
