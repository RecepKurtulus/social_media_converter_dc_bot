// Initialize dotenv
require('dotenv').config()
const ytdl = require('ytdl-core')
const slugify = require('slugify')
const TikTokScraper = require('tiktok-scraper');
const fs = require('fs')
const path = require('path')
// Discord.js versions ^13.0 require us to explicitly define client intents
const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
} = require('discord.js')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

function formatSize(sizeInBytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (sizeInBytes >= 1024 && index < units.length - 1) {
    sizeInBytes /= 1024
    index++
  }
  return `${sizeInBytes.toFixed(2)} ${units[index]}`
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity('Burdayım be burdayım !')
})

client.on('messageCreate', async (message) => {
  try {
    if (message.content.startsWith('!youtube')) {
      // Özel bir komut kullanarak embed mesajını oluşturabilirsiniz
      const videoUrl = message.content.slice(8) // Başlangıçtan sonra gelen URL'yi alın
      console.log(`Video Url:${videoUrl}`)
      message.reply('Video downloading ✅')
      console.log('Video is downloading rn ✅')
      const info = await ytdl.getInfo(videoUrl)
      const videoTitle = slugify(info.videoDetails.title, '_')
      const desc = info.videoDetails.description
      const videoID = info.videoDetails.videoId

      // Embed mesajını oluştur
      const videoStream = ytdl(videoUrl, {
        quality: 'highestvideo',
        filter: 'audioandvideo',
      })
      console.log('Video is downloading rn ✅')

      const downloadFolder = path.join(require('os').homedir(), 'Downloads')
      const filePath = `${downloadFolder}/${videoTitle}.mp4`
      const writeStream = fs.createWriteStream(filePath)

      videoStream.pipe(writeStream)

      writeStream.on('finish', async () => {
        const embed = new EmbedBuilder()
          .setColor(Math.floor(Math.random() * 16777215).toString(16)) // Embed mesajının rengi
          .setTitle(`${videoTitle} downloaded successfully ✅ `)
          .setURL(videoUrl)
          .setDescription(
            'If you like the bot, you can move us up by commenting on our top.gg page 😏',
          )

        const videoAttachment = new AttachmentBuilder(filePath)
        console.log(videoAttachment)

        await message.channel.send({
          embeds: [embed],
          files: [videoAttachment],
        })
        try {
          fs.rm(filePath, { recursive: true, force: true }, (error) => {
            //you can handle the error here
            console.log(error)
          })
          console.log('Video deleted from our disk successfully✅')
        } catch (error) {
          console.log('❌There is a problem about deleting file:', error)
        }
      })
    }

    
  } catch (error) {
    console.log(error.stack)
  }
})

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!indir')) {
    const videoUrl = message.content.slice(6) // Başlangıçtan sonra gelen URL'yi alın
    message.reply(`Video indirmesi başlatılıyor ${message.author.username}`)

    try {
      const info = await ytdl.getInfo(videoUrl)

      const videoTitle = slugify(info.videoDetails.title, '_')
      const videoStream = ytdl(videoUrl, {
        quality: 'highestvideo',
        filter: 'audioandvideo',
      })
      const downloadFolder = path.join(require('os').homedir(), 'Downloads')
      const filePath = `${downloadFolder}/${videoTitle}.mp4`
      const writeStream = fs.createWriteStream(filePath)
      let downloaded = 0 // İndirilen veri miktarını takip etmek için bir değişken
      const totalSize = info.videoDetails.lengthSeconds // Toplam video süresi
      const progressInterval = setInterval(() => {
        const progress = Math.round(downloaded / totalSize / 1000)

        ;((totalSize - downloaded) / (downloaded || 1)) * (progress / 100)

        message.reply(
          `İndirme devam ediyor: ${videoTitle}\nİndirme Yüzdesi: ${progress.toFixed(
            2,
          )}
          \nİndirilen Boyut: ${formatSize(downloaded)}`,
        )
        console.log(progress)
      }, 100) // Her 5 saniyede bir güncelleme yap

      videoStream.on('data', (chunk) => {
        downloaded += chunk.length
      })

      videoStream.on('end', () => {
        clearInterval(progressInterval)
        message.reply(
          ` ✅ İndirme tamamlandı: ${videoTitle}  Dosya Yolu: ${filePath}`,
          message.author.username,
        )
      })

      videoStream.pipe(writeStream)
    } catch (error) {
      console.error('Video indirme hatası:', error)
      await message.channel.send('Video indirme sırasında bir hata oluştu.')
    }
  }
})

client.login(process.env.CLIENT_TOKEN)
