/* istanbul ignore file */
import { injectable } from "inversify";
import {HttpRequest, HttpResponse} from '@aws-sdk/protocol-http'
import {Sha256} from '@aws-crypto/sha256-js'
import {defaultProvider} from '@aws-sdk/credential-provider-node'
import {SignatureV4} from '@aws-sdk/signature-v4'
import {NodeHttpHandler} from '@aws-sdk/node-http-handler'
import { AwsHttpClient, HttpRequestOptions } from "./aws-http-client.isvc";
import { GenericError } from "./GenericError";

async function createSignedHttpRequest(httpRequestParams: HttpRequestOptions): Promise<HttpRequest> { 
  const httpRequest = new HttpRequest(httpRequestParams);
  const sigV4Init = {
    credentials: defaultProvider(),
    region: process.env.AWS_DEFAULT_REGION  || 'ca-central-1',
    service: 'es',
    sha256: Sha256,
  }
  const signer = new SignatureV4(sigV4Init);
  return signer.sign(httpRequest) as unknown as HttpRequest;
}

@injectable()
export class AwsHttpClientImpl implements AwsHttpClient  {
  async executeSignedHttpRequest(httpRequestParams: HttpRequestOptions): Promise<{ response: HttpResponse; }> {
    const signedHttpRequest = await createSignedHttpRequest(httpRequestParams) as HttpRequest
    const nodeHttpHandler = new NodeHttpHandler();
    return nodeHttpHandler.handle(signedHttpRequest)
    .catch(error => {
      throw new GenericError('Error calling AWS endpoint', error)
    })
  }
  waitAndReturnResponseBody(res: { response: HttpResponse; }): Promise<{ statusCode: number; body: string; }> {
    return new Promise((resolve, reject) => {
      const incomingMessage = res.response.body;
      let body = "";
      incomingMessage.on("data", (chunk: any) => {
        body += chunk;
      });
      incomingMessage.on("end", (a1:any, a2: any) => {
        resolve({statusCode: res.response.statusCode, body:body});
      });
      incomingMessage.on("error", (err: any) => {
        reject(err);
      });
    });
  }
  
}
