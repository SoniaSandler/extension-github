/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
import { beforeEach, expect, test, vi } from 'vitest';

import { Utils } from './utils';

class UtilsTest extends Utils {
  public commandsNumber(): number {
    return this.commands.length;
  }
}

const utils = new UtilsTest();

const disposeMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
});

test('register commands', () => {
  vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: disposeMock });
  utils.registerCommands();

  expect(extensionApi.commands.registerCommand).toHaveBeenCalledTimes(1);
  expect(extensionApi.commands.registerCommand).toHaveBeenCalledWith('github.copy', expect.any(Function));
  expect(utils.commandsNumber()).toBe(1);
});

test('deregister commands', () => {
  utils.deregisterCommands();

  expect(disposeMock).toHaveBeenCalledTimes(1);
  expect(utils.commandsNumber()).toBe(0);
});
