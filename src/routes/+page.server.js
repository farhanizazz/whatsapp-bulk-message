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
                headless: true
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

        const json = excelToJson({
            sourceFile: `./files/${fileName}.xls`
        });

        var counter = 0;

        client.on('ready', () => {
            console.log('Client is ready!');
            json.Sheet1.forEach(async (item, index) => {
                const chatId = item.A.toString().substring(0) + "@c.us";
                const number_details = await client.getNumberId(item.A.toString());
                console.log(number_details)
                if (number_details) {
                    if (img.size > 0) {
                        const media = MessageMedia.fromFilePath('./files/temp.png');
                        client.sendMessage(chatId, media, { caption: msg });
                        counter++;
                    } else {
                        client.sendMessage(chatId, msg);
                        counter++;
                    }
                }
                else {
                    counter++;
                    console.log('invalid number')
                }
            });
            fs.unlink(`./files/${fileName}.xls`, (err) => {
                if (err) throw err //handle your error the way you want to;
                // console.log('path/file.txt was deleted');//or else the file will be deleted
            });
        });

        client.on('message_ack', (msg, ack) => {
            if (ack == 3) {
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