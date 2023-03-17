import Service from './service';

export default class DiscordService extends Service {
    private channel: string = process.env.DISCORD_CHANNEL;

    constructor() {
        super('https://discord.com/api/v9', process.env.DISCORD_TOKEN);
    }

    public getLastCodes(limit: number = 5): Promise<any> {
        return this.get(`/channels/${this.channel}/messages?limit=${limit}`);
    }
}
