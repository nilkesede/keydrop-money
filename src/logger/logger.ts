import chalk from 'chalk';

namespace Logger {
    export function applyMessageElements(account): string {
        const elements = [];
        if (account) {
            elements.push(`[${account.name}]`);
        }
        elements.push(`[${new Date().toLocaleTimeString()}]`);

        return elements.join(' ');
    }

    export function info(account, message: string) {
        console.log(
            `${chalk.white(
                `${this.applyMessageElements(account)} INFO » `
            )} ${message}`
        );
    }

    export function notice(account, message: string) {
        console.log(
            `${chalk.blueBright(
                `${this.applyMessageElements(account)} NOTICE » `
            )} ${message}`
        );
    }

    export function success(account, message: string) {
        console.log(
            `${chalk.greenBright(
                `${this.applyMessageElements(account)} SUCCESS » `
            )} ${message}`
        );
    }

    export function warning(account, message: string) {
        console.log(
            `${chalk.yellow(
                `${this.applyMessageElements(account)} WARNING » `
            )} ${message}`
        );
    }

    export function error(account, message: string) {
        console.log(
            `${chalk.red(
                `${this.applyMessageElements(account)} ERROR » `
            )} ${message}`
        );
    }
}

export default Logger;
export { Logger };
