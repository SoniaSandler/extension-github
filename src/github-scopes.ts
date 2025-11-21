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

export const GITHUB_SCOPES: { [key: string] : string[]} = {
  'repo': [
    'repo:status',
    'repo_deployment',
    'public_repo',
    'repo:invite',
    'security_events',
  ],
  'admin:repo_hook': [
    'write:repo_hook',
    'read:repo_hook',
  ],
  'write:repo_hook': [
    'read:repo_hook',
  ],
  'admin:org': [
    'write:org',
    'read:org',
  ],
  'write:org': [
    'read:org',
  ],
  'admin:public_key': [
    'write:public_key',
    'read:public_key',
  ],
  'write:public_key': [
    'read:public_key',
  ],
  'user': [
    'read:user',
    'user:email',
    'user:follow',
  ],
  'project': [
    'read:project',
  ],
  'write:packages': [
    'read:packages',
  ],
  'admin:gpg_key': [
    'write:gpg_key',
    'read:gpg_key',
  ],
  'write:gpg_key': [
    'read:gpg_key',
  ],
};
