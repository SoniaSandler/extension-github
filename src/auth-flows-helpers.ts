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

import type { IGitHubDeviceCodeResponse } from './auth-flows';
import { config } from './config';

export async function waitForDeviceCodeAccessToken(deviceResponseJSON: IGitHubDeviceCodeResponse, sessionId: number, attempts: number): Promise<extensionApi.AuthenticationSession> {
  const accessTokenUri = extensionApi.Uri.parse('https://github.com/login/oauth/access_token').with({
    query: `client_id=${config.CLIENT_ID}&device_code=${deviceResponseJSON.device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
  });

  let waitInterval = deviceResponseJSON.interval;

	for (let i = 0; i < attempts; i++) {

    // wait the minimum time interval before checking if user authorized the app on GitHub

    await new Promise(resolve => setTimeout(resolve, waitInterval * 1000));

    waitInterval = deviceResponseJSON.interval;
    
    let response;

    try {
      response = await fetch(accessTokenUri.toString(),
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
        },
      );
    } catch {
      continue;
    }

    if (!response.ok) {
      continue;
    }

    const accessTokenJson = await response.json();

    if (accessTokenJson.error === 'authorization_pending') {
      continue;
    } else if (accessTokenJson.error === 'slow_down') {

      // a slow_down error includes the new interval needed to wait until the next check
      waitInterval = accessTokenJson.interval ;

      continue;
    } else if (accessTokenJson.error === 'expired_token') {
      console.log('Device code expired expired, please start the log in process again');
      break;
    } else if (accessTokenJson.error === 'access_denied') {
      console.log('User cancelled, please start the log in process again');
      break;
    }

    const octokit = new Octokit({
      auth: accessTokenJson.access_token,
    });
    const user = await octokit.rest.users.getAuthenticated();

    return {
      id: `github-device-access-token-${sessionId}`,
      accessToken: accessTokenJson.access_token,
      account: {
        id: `${user.data.id}`,
        label: user.data.login,
      },
      scopes: (accessTokenJson.scope as string).split(','),
    };
  }

  throw new Error('Authorization timed out');
}
