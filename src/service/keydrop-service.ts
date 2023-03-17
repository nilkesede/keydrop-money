import Service from './service';

export default class KeydropService extends Service {
    constructor(token: string) {
        super('https://key-drop.com/en', token);
    }

    private getBalance(): Promise<any> {
        return this.get('/balance');
    }

    private usePromocode(promocode: string): Promise<any> {
        return this.post(`/Api/activation_code`, {
            promoCode: promocode,
            recaptcha: null,
        });
    }

    private getUserProfile(): Promise<any> {
        return this.get(`/apiData/Init/index`);
    }
}
