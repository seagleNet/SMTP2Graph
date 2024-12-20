import { INetworkModule, NetworkRequestOptions, NetworkResponse } from "@azure/msal-node";
import { Config } from "./Config";
import fetch, { RequestInit, Response } from 'node-fetch';
import { prefixedLog } from './Logger';

const log = prefixedLog('MsalProxy');
export class MsalProxy implements INetworkModule
{
    sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>>
    {
        return this.#sendRequestAsync(url, 'GET', options);
    }

    sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>>
    {
        return this.#sendRequestAsync(url, 'POST', options);
    }

    async #sendRequestAsync<T>(url: string, method: 'GET' | 'POST', options: NetworkRequestOptions = {}): Promise<NetworkResponse<T>>
    {
        const requestConfig: RequestInit = {
            method: method,
            headers: options.headers,
            body: options.body,
            agent: Config.httpProxyConfig,
        };

        log('verbose', `Request config: ${JSON.stringify(requestConfig)}`);

        let response: Response;

        try {
            response = await fetch(url, requestConfig);
        } catch (error) {
            // Handle the error appropriately (e.g., log it, re-throw it, or return an error response)
            console.error('Error fetching data:', error);
            throw error; // Re-throwing the error in this example
        }

        log('verbose', `Received response: ${JSON.stringify(response)}`);

        const data = await response.json() as { access_token: string };

        log('verbose', `Extracted data: ${JSON.stringify(data)}`);

        return {
            headers: response.headers as any,
            body: data as T,
            status: response.status,
        };
    }
}
