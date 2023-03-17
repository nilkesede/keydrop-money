import { config } from 'dotenv';

import { Client } from './client';

config();

const accounts = [
    {
        name: 'NAME',
        token: 'session_id=SESSION_ID;',
    },
];

const client = new Client(accounts);
client.initialize();
