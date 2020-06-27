import 'isomorphic-unfetch';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';

export class DialogueWiseService {
  readonly apiBaseUrl = 'https://api.dialoguewise.com/api/';

  async getDialogue(request: DialogueWiseRequest) {
    const currentUtc = moment.utc().format('DD/MM/YYYY hh:mm:ss a');
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

    const response = await fetch(apiUrl, {
      method: 'post',
      headers,
      body: request.variableList ? JSON.stringify(request.variableList) : null,
    });

    const respJson = await response.json();
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
