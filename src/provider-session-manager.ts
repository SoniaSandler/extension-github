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

import * as extensionApi from '@podman-desktop/api';

import { deviceFlow,PATFlow } from './auth-flows';

export const AUTHENTICATION_SESSIONS_KEY = 'github-authentication-sessions';

export class ProviderSessionManager {
  protected onDidChangeSessions = new extensionApi.EventEmitter<extensionApi.AuthenticationProviderAuthenticationSessionsChangeEvent>();
  
  protected ghSessions: extensionApi.AuthenticationSession[] = [];

  constructor(private extensionContext: extensionApi.ExtensionContext) {}

  async restoreSessions(): Promise<void> {
    const storedSessions = await this.extensionContext.secrets.get(AUTHENTICATION_SESSIONS_KEY);

    if (storedSessions) {
      this.ghSessions = JSON.parse(storedSessions) as extensionApi.AuthenticationSession[];
    } else {
      this.ghSessions = [];
    }
  }
  
  async createSession(scopes: string[]): Promise<extensionApi.AuthenticationSession> {
    let newAuthSession: extensionApi.AuthenticationSession;
  
    const result = await extensionApi.window.showInformationMessage('To authenticate to GitHub from Podman Dekstop you can either provide an exisiting Personal Access Token (PAT) with the nessecary permission or sign in to GitHub from the browser',
      'Use PAT',
      'Use browser',
      'Cancel',
    );
  
    if (result === 'Use PAT') {
      newAuthSession = await PATFlow(scopes);
    } else if (result === 'Use browser') {
      newAuthSession = await deviceFlow(scopes);
    } else {
      throw new Error('Could not complete authentication flows');
    }

    this.ghSessions.push(newAuthSession);
    this.onDidChangeSessions.fire({ added: [newAuthSession] });

    return newAuthSession;
  }
  
  async getSessions(scopes?: string[]): Promise<readonly extensionApi.AuthenticationSession[]> {
    if (!scopes) {
      return this.ghSessions;
    }

    const matchingSessions = this.ghSessions.filter(session =>
      scopes.every(scope => session.scopes.includes(scope)),
    );
    return matchingSessions;
  }
  
  async removeSession(sessionId: string): Promise<void> {
    const sessionIndex = this.ghSessions.findIndex(session => session.id === sessionId);
    if (sessionIndex === -1) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    const removedSession = this.ghSessions.splice(sessionIndex, 1)[0];
    this.onDidChangeSessions.fire({
      removed: [removedSession],
    });
  }

  async registerAuthenticationProvider(): Promise<void> {

    const authDisposable = extensionApi.authentication.registerAuthenticationProvider(
      'github-authentication',
      'GitHub authentication',
      {
        onDidChangeSessions: this.onDidChangeSessions.event,
        createSession: this.createSession.bind(this),
        getSessions: this.getSessions.bind(this),
        removeSession: this.removeSession.bind(this),
      },
      {
        images: {
          icon: 'icon.png',
        },
      },
    );

    this.extensionContext.subscriptions.push(authDisposable);
  }

  async saveSessions(): Promise<void> {
    await this.extensionContext.secrets.store(AUTHENTICATION_SESSIONS_KEY, JSON.stringify(this.ghSessions));
  }
}
