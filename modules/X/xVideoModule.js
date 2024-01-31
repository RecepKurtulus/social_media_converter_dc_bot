
require('dotenv').config()
const slugify = require('slugify')
const fs = require('fs')
const path = require('path')
const { fetchDataFromX } = require("./xDataScraper");
// Discord.js versions ^13.0 require us to explicitly define client intents
const {
  
  
  AttachmentBuilder,
  

} = require('discord.js')

module.exports.xVideoModule = async (message,client) => {

  try{
        //Downloading video to our storage
        const videoUrl = message.options.getString('link');
        const firstReply=message.reply('Video Converting...');
        
        const filePath = await fetchDataFromX(videoUrl);
        console.log(`Modüldeki filePath: ${filePath}`)
        const videoAttachment = new AttachmentBuilder(filePath)
        console.log(videoAttachment)
        await message.editReply({
            content: 'Video Converted!',
            files: [videoAttachment],

          })
          
            fs.rm(filePath, (error) => {
                if (error) {
                  console.log('❌ Dosya silinirken bir hata oluştu:', error);
                } else {
                  console.log('Video başarıyla diskten silindi✅');
                }
              }); 

            
          
      }
      catch(error){
        console.log(error);
    }
    }
    
