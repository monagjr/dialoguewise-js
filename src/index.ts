import * as CryptoJS from 'crypto-js';

export class DialogueWiseService {
  readonly apiBaseUrl = 'https://api.dialoguewise.com/api/';

  doRequest(options: object, postData: any) {
    return new Promise((resolve, reject) => {
      let respJson = null;
      let https = null;
      try {
        https = require('https');
      } catch (e) {
        reject(e);
      }

      const postReq = https.request(options);
      postReq.on('response', (res: any) => {
        res.setEncoding('utf8');
        let body = '';
        res.on('data', (data: any) => {
          body += data;
        });
        res.on('end', () => {
          respJson = JSON.parse(body);
          resolve(respJson);
        });
      });
      postReq.on('error', (err: any) => {
        reject(err);
      });

      if (postData) postReq.write(postData);
      postReq.end();
    });
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : String(n);
  }

  getCurrentUtc() {
    const currentTime = new Date();
    let currentUtc: string = '';
    currentUtc += this.pad(currentTime.getUTCDate());
    currentUtc += '/';
    currentUtc += this.pad(currentTime.getUTCMonth() + 1);
    currentUtc += '/';
    currentUtc += this.pad(currentTime.getUTCFullYear());
    currentUtc += ' ';
    let currentUtcHour = currentTime.getUTCHours();
    const currentUtcAMPM: string = currentUtcHour >= 12 ? 'PM' : 'AM';
    currentUtcHour = currentUtcHour > 12 ? currentUtcHour - 12 : currentUtcHour;
    currentUtcHour = currentUtcHour === 0 ? 12 : currentUtcHour;
    currentUtc += this.pad(currentUtcHour);
    currentUtc += ':';
    currentUtc += this.pad(currentTime.getUTCMinutes());
    currentUtc += ':';
    currentUtc += this.pad(currentTime.getUTCSeconds());
    currentUtc += ' ';
    currentUtc += currentUtcAMPM;
    return currentUtc;
  }

  async getDialogue(request: DialogueWiseRequest) {
    const currentUtc = this.getCurrentUtc();
    // The Pilot flag allows you to get the piloted content. Allows you to test your content.
    const isPilotFlag = request.isPilot != null && request.isPilot ? '&isPilotVersion=true' : '';
    let pageFlag = '';

    if (
      (request.pageSize == null && request.pageIndex != null) ||
      (request.pageSize != null && request.pageIndex == null)
    ) {
      throw new Error('Please set both pageSize and pageIndex');
    } else if (request.pageSize != null && request.pageIndex != null) {
      // The page flag allows you to get paginated data. If not passed it will return all data.
      pageFlag = '&pageSize=' + request.pageSize.toString() + '&pageIndex=' + request.pageIndex.toString();
    }

    const apiUrl = this.apiBaseUrl + 'dialogue/getdialogue?dialogueName=' + request.slug + isPilotFlag + pageFlag;
    const message = '/api/dialogue/getdialogue:' + currentUtc;
    // hash message
    const key = request.apiKey;
    const hash = CryptoJS.HmacSHA256(message, key);
    const hashMessage = CryptoJS.enc.Base64.stringify(hash);

    const authentication = request.emailHash + ':' + hashMessage;

    const headers = {
      'Content-Type': 'application/json',
      Timestamp: currentUtc,
      Authentication: authentication,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Timestamp, Authentication',
    };

    let respJson = null;
    const postData = request.variableList ? JSON.stringify(request.variableList) : null;
    // are we on Browser side or Node side
    if (typeof process === 'object') {
      // Node side
      const myURL = new URL(apiUrl);
      const postOptions = {
        host: myURL.hostname,
        port: '443',
        path: myURL.pathname + myURL.search,
        method: 'POST',
        headers,
      };
      respJson = await this.doRequest(postOptions, postData);
    } else {
      try {
        const response = await fetch(apiUrl, {
          method: 'post',
          headers,
          body: postData,
        });
        respJson = await response.json();
      } catch (e) {
        throw e;
      }
    }
    return respJson;
  }
}

export interface DialogueWiseRequest {
  slug: string;
  apiKey: string;
  emailHash: string;
  isPilot?: boolean;
  variableList?: Map<string, any>;
  pageSize?: number;
  pageIndex?: number;
}
