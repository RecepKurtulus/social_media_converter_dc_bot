// Initialize dotenv
require('dotenv').config()
const ytdl = require('ytdl-core');
const slugify = require('slugify');

const fs = require('fs');
const path = require('path');
// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, GatewayIntentBits } = require('discord.js')
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
      const downloadFolder = path.join(require('os').homedir(), 'Downloads');
      const filePath = `${downloadFolder}/${videoTitle}.mp4`
      const writeStream = fs.createWriteStream(filePath)
      let downloaded = 0 // İndirilen veri miktarını takip etmek için bir değişken
      const totalSize = info.videoDetails.lengthSeconds // Toplam video süresi
      const progressInterval = setInterval(() => {
      const progress = downloaded / totalSize;
      
          ((totalSize - downloaded) / (downloaded || 1)) * (progress / 100)

        message.reply(
          `İndirme devam ediyor: ${videoTitle}\nİndirme Yüzdesi: ${progress.toFixed(
            2,
          )}
          \nİndirilen Boyut: ${formatSize(downloaded)}`,
        )
      }, 5000) // Her 5 saniyede bir güncelleme yap

      videoStream.on('data', (chunk) => {
        downloaded += chunk.length
      })

      videoStream.on('end', () => {
        clearInterval(progressInterval)
        message.reply(
          `İndirme tamamlandı: ${videoTitle}  Dosya Yolu: ${filePath}`,
          message.author.username,
        )
      })

      videoStream.pipe(writeStream)

      writeStream.on('finish', () => {
        message.channel.send(`Video indirildi: ${videoTitle}`, {
          files: [filePath],
        })
      })
    } catch (error) {
      console.error('Video indirme hatası:', error)
      await message.channel.send('Video indirme sırasında bir hata oluştu.')
    }
  }
})

client.login(process.env.CLIENT_TOKEN)
