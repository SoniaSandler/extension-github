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

import { ProviderSessionManager } from './provider-session-manager';

let providerSessionManager: ProviderSessionManager;

// Initialize the activation of the extension.
export async function activate(context: extensionApi.ExtensionContext): Promise<void> {
  console.log('starting GitHub authentication extension');

  providerSessionManager = new ProviderSessionManager(context);
  await providerSessionManager.registerAuthenticationProvider();
  await providerSessionManager.restoreSessions();
  await createSessionEntry();
}

async function createSessionEntry(): Promise<void> {
  await extensionApi.authentication.getSession('github-authentication', [], { createIfNone: false });
}

// Deactivate the extension
export async function deactivate(): Promise<void> {
  await providerSessionManager?.saveSessions();
  console.log('stopping GitHub authentication extension');
}
