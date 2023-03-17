import axios, { Axios } from 'axios';

export default class Service {
    private request: Axios;

    private token: string;

    private userAgent: string =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';

    constructor(baseUrl: string, token: string) {
        this.token = token;
        this.request = axios.create({
            baseURL: baseUrl,
            headers: {
                'User-Agent': this.userAgent,
            },
        });
    }

    public async get(url: string): Promise<any> {
        const { data } = await this.request.get(url, {
            withCredentials: true,
            headers: {
                Authorization: this.token,
                Cookie: this.token,
            },
        });

        return data;
    }

    public async post(url: string, payload: object): Promise<any> {
        const { data } = await this.request.post(url, JSON.stringify(payload), {
            withCredentials: true,
            headers: {
                'content-type': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                Authorization: this.token,
                Cookie: this.token,
            },
        });

        return data;
    }
}
