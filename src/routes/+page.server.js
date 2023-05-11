import fs from 'fs';
import { writeFile } from 'fs/promises';
import util from 'util';
import excelToJson from 'convert-excel-to-json';
import { Client, LocalAuth } from 'whatsapp-web.js';
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
        await writeFile(`./files/${fileName}.xls`, file.stream());
        
        const json = excelToJson({
            sourceFile: `./files/${fileName}.xls`
        });

        // console.log(json.Sheet1)

        client.on('ready', () => {
            console.log('Client is ready!');
            json.Sheet1.forEach((item, index) => {
                const chatId = item.A.toString().substring(0) + "@c.us";
                client.sendMessage(chatId, msg);
                console.log(chatId + ' ' + msg)
            });
            fs.unlink(`./files/${fileName}.xls`, (err) => {
                if (err) throw err //handle your error the way you want to;
                console.log('path/file.txt was deleted');//or else the file will be deleted
            });
        });
        

        return { success: true };
    }
};