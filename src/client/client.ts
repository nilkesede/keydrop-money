import { randomUUID } from 'crypto';
import chalk from 'chalk';

import { DiscordService, KeydropService } from '../service';
import { Logger } from '../logger';

class Client {
    private accounts: Array<any>;

    private currentTick: number;

    private goldenCodeCache: Array<string>;

    private discordService: DiscordService;

    private tickrate = {
        base: 20,
        verify: 20 * 30,
        updateProfile: 20 * 60 * 10,
    };

    public constructor(accounts: Array<any>) {
        this.accounts = accounts;
        this.goldenCodeCache = [];
        this.currentTick = 0;
        this.discordService = new DiscordService();
    }

    public async initialize() {
        this.accounts = this.accounts.map((account) => {
            const uuid = randomUUID();
            const keydropService = new KeydropService(account.token);

            return {
                ...account,
                uuid,
                keydropService,
                totalEarned: 0,
            };
        });

        await this.updateProfiles();
        await this.run();
    }

    private async updateProfiles() {
        this.accounts = await Promise.all(
            this.accounts.map(async (account) => {
                const profile = await account.keydropService.getUserProfile();

                if (profile.userName) {
                    Logger.notice(
                        account,
                        `Profile updated! Actual balance is ${chalk.whiteBright(
                            profile.balance
                        )}${profile.currency} and ${chalk.yellowBright(
                            profile.gold
                        )} gold.`
                    );
                    Logger.notice(
                        account,
                        `You have earned an total of ${chalk.yellowBright(
                            account.totalEarned
                        )} gold.`
                    );
                } else {
                    Logger.warning(account, 'Failed to update user profile.');
                }

                return {
                    ...account,
                    profile: profile.userName ? profile : null,
                };
            })
        );
    }

    private delay(ms: number = this.tickrate.base) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000 / ms);
        });
    }

    private async searchForGold() {
        const response = await this.discordService.getLastCodes(6);
        return response.reduceRight((acc, item) => {
            const goldenCode = (item?.content ?? '').replace(/`/g, '');
            const goldenTime = new Date(
                item?.timestamp ?? '2023-01-01T00:00:00'
            );
            const timeDiff = Math.floor(
                Math.abs(new Date().valueOf() - goldenTime.valueOf()) /
                    1000 /
                    60
            );
            if (
                goldenCode.length === 17 &&
                !this.goldenCodeCache.includes(goldenCode) &&
                timeDiff < 60 * 3
            ) {
                Logger.notice(
                    null,
                    `New golden code encountered! Code: ${chalk.yellowBright(
                        goldenCode
                    )}.`
                );

                this.goldenCodeCache.push(goldenCode);

                acc.push(goldenCode);
                return acc;
            }

            return acc;
        }, []);
    }

    private async consumeGolds(goldenCode) {
        this.accounts = await Promise.all(
            this.accounts.map(async (account) =>
                account.keydropService
                    .usePromocode(goldenCode)
                    .then((response) => {
                        let totalEarned = 0;
                        if (response?.status) {
                            const earned = response.bonus ?? response.goldBonus;
                            totalEarned = parseInt(earned, 10);
                            Logger.success(
                                account,
                                `You received ${chalk.yellowBright(
                                    earned
                                )} gold for using the code ${chalk.yellowBright(
                                    response.promoCode
                                )}.`
                            );
                        } else if (response.promoCode && response.info) {
                            Logger.error(
                                account,
                                `Can't use code ${chalk.redBright(
                                    response.promoCode
                                )} because, ${chalk.redBright(response.info)}.`
                            );
                        } else {
                            Logger.error(
                                account,
                                `Can't use code ${chalk.redBright(
                                    goldenCode
                                )} because, ${chalk.redBright(
                                    'has expired or is invalid'
                                )}.`
                            );
                        }

                        return {
                            ...account,
                            totalEarned: account.totalEarned + totalEarned,
                        };
                    })
            )
        );
    }

    private async run() {
        while (true) {
            await this.delay();
            this.currentTick += 1;

            if (this.currentTick % this.tickrate.verify === 0) {
                Logger.info(null, 'Verifying golden codes...');
                const golds = await this.searchForGold();

                if (golds.length > 0) {
                    await Promise.all(
                        golds.map((gold) => this.consumeGolds(gold))
                    );

                    const timeToUseAgain = 1000 * 10;
                    await this.delay(timeToUseAgain);
                    this.currentTick += this.tickrate.base * 10;
                }
            }

            if (this.currentTick % this.tickrate.updateProfile === 0) {
                await this.updateProfiles();
            }
        }
    }
}

export default Client;
export { Client };
