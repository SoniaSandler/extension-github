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

import { CommandHelper } from './CommandHelper';

class CommandHelperTest extends CommandHelper {
  public commandsNumber(): number {
    return this.commands.length;
  }
}

let commandHelper: CommandHelperTest;

const disposeMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  commandHelper = new CommandHelperTest();
  vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: disposeMock });
});

test('register commands', () => {
  commandHelper.registerCommands();

  expect(extensionApi.commands.registerCommand).toHaveBeenCalledTimes(1);
  expect(extensionApi.commands.registerCommand).toHaveBeenCalledWith('github.copy', expect.any(Function));
  expect(commandHelper.commandsNumber()).toBe(1);
});

test('deregister commands', () => {
  commandHelper.registerCommands();
  commandHelper.deregisterCommands();

  expect(disposeMock).toHaveBeenCalledTimes(1);
  expect(commandHelper.commandsNumber()).toBe(0);
});
