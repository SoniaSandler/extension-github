/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';

import { waitForDeviceCodeAccessToken } from './auth-flows-helpers';
import { config } from './config';

export let sessionId = 1;

export interface IGitHubDeviceCodeResponse {
	device_code: string;
	user_code: string;
	verification_uri: string;
	interval: number;
  expires_in: number;
}

// use for oauth device flow https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
export async function deviceFlow(scopes: string[]): Promise<extensionApi.AuthenticationSession> {

  // get device code and user code
  const deviceCodeUri = extensionApi.Uri.parse('https://github.com/login/device/code').with({query: `client_id=${config.CLIENT_ID}&scope=${scopes.join('%20')}`});

  const deviceCodeResponse = await fetch(deviceCodeUri.toString(),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!deviceCodeResponse.ok) {
    throw new Error(`Failed to get one-time code: ${await deviceCodeResponse.text()}`);
  };
  
  const jsonBody = await deviceCodeResponse.json() as IGitHubDeviceCodeResponse;


  // TODO: change expiration time to date now + expires in or remove time altogether
  // show user code in the UI
  const infoResult = await extensionApi.window.showInformationMessage(`To authenticate, click on the GitHub button below and enter the code ${jsonBody.user_code}.\nThis code will expire in ${Math.round(jsonBody.expires_in/60)} minutes`,
    'Cancel',
    'Continue to GitHub',
  );

  // TODO: add notification for the device code and github link similar to https://github.com/microsoft/vscode/pull/139255 (last screenshot)

  if (infoResult !== 'Continue to GitHub') {
    throw new Error('Cannot authenticate using device flow, cancelled by user');
  }

  // direct the user to enter to user code on GitHub
  if (infoResult === 'Continue to GitHub') {
    const deviceLoginUri = extensionApi.Uri.parse('https://github.com/login/device');
    await extensionApi.env.openExternal(deviceLoginUri);
  }


  // wait and check if user authorized Podman Desktop on GitHub
  return waitForDeviceCodeAccessToken(jsonBody, sessionId++, 20);
};


// use user provided Personal Access Token
export async function PATFlow(scopes: string[]): Promise<extensionApi.AuthenticationSession> {
  const inputBoxOptions: extensionApi.InputBoxOptions = {
    title: 'Authenticate to GitHub with Personal Access Token',
    prompt: `Enter you GitHub Personal Access Token in the input box below. Make sure that this PAT has all the necessary permissions: ${scopes.join(', ')}`,
    placeHolder: 'Enter PAT',
    password: true,
  };

  const PATToken = await extensionApi.window.showInputBox(inputBoxOptions);

  if (!PATToken) {
    throw new Error('No Personal Access Token provided');
  }

  const octokit = new Octokit({
    auth: PATToken,
  });
  const user = await octokit.rest.users.getAuthenticated();

  return {
    id: `github-PAT-${sessionId++}`,
    accessToken: PATToken,
    account: {
      id: `${user.data.id}`,
      label: user.data.login,
    },
    scopes: scopes,
  };
} 
