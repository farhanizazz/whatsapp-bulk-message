import fs from 'fs';
import { writeFile } from 'fs/promises';
import util from 'util';
import excelToJson from 'convert-excel-to-json';
import { Client, LocalAuth, MessageMedia, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal'
import { redirect } from '@sveltejs/kit';


export const actions = {
    upload: async ({ cookies, request, locals }) => {

        const client = new Client({
            authStrategy: new LocalAuth(),
            // proxyAuthentication: { username: 'username', password: 'password' },
            puppeteer: {
                // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
                headless: false
            }
        });

        client.initialize();

        client.on('loading_screen', (percent, message) => {
            console.log('LOADING SCREEN', percent, message);
        });

        client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
        });

        client.on('authenticated', () => {
            console.log('AUTHENTICATED');
        });

        client.on('auth_failure', msg => {
            // Fired if session restore was unsuccessful
            console.error('AUTHENTICATION FAILURE', msg);
        });




        const data = await request.formData();
        const fileName = 'temp'

        const file = data.get('file');
        const msg = data.get('msg');
        const img = data.get('image')
        console.log(img.size)
        await writeFile(`./files/${fileName}.xls`, file.stream());
        await writeFile(`./files/${fileName}.png`, img.stream());
        const regex = /^62\d+$/;

        const json = excelToJson({
            sourceFile: `./files/${fileName}.xls`
        });

        var counter = 0;



        client.on('ready', () => {
            console.log('Client is ready!');
            json.Sheet1.forEach(async (item, index) => {
                // const chatId = item.A.toString().substring(0) + "@c.us";
                // console.log(item)
                if (regex.test(item.A.toString())) {
                    const number_details = await client.getNumberId(item.A.toString());
                    if (number_details) {
                        if (img.size > 0) {
                            const media = MessageMedia.fromFilePath('./files/temp.png');
                            // console.log(number_details)
                            client.sendMessage(number_details._serialized, media, { caption: msg });
                            counter++;
                        } else {
                            // console.log(number_details._serialized)
                            client.sendMessage(number_details._serialized, msg);
                            counter++;
                        }
                    }
                    else {
                        counter++;
                        // console.log('invalid number')
                    }
                }

        });
        fs.unlink(`./files/${fileName}.xls`, (err) => {
            if (err) throw err //handle your error the way you want to;
            // console.log('path/file.txt was deleted');//or else the file will be deleted
        });
    });

client.on('message_ack', (msg, ack) => {
    if (ack == 2) {
        if (counter == json.Sheet1.length) {
            client.destroy()
            counter = 0;
            console.log('sukses')
        }
    }
})
return { success: true };
    }
};