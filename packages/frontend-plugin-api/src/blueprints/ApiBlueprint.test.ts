/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createExtensionInput } from '../wiring';
import { ApiBlueprint } from './ApiBlueprint';
import { createApiRef } from '@backstage/core-plugin-api';

describe('ApiBlueprint', () => {
  it('should create an extension with sensible defaults', () => {
    const api = createApiRef<{ foo: string }>({ id: 'test' });

    const extension = ApiBlueprint.make({
      params: define =>
        define({
          api,
          deps: {},
          factory: () => ({ foo: 'bar' }),
        }),
      name: 'test',
    });

    expect(extension).toMatchInlineSnapshot(`
      {
        "$$type": "@backstage/ExtensionDefinition",
        "T": undefined,
        "attachTo": {
          "id": "root",
          "input": "apis",
        },
        "configSchema": undefined,
        "disabled": false,
        "factory": [Function],
        "inputs": {},
        "kind": "api",
        "name": "test",
        "output": [
          [Function],
        ],
        "override": [Function],
        "toString": [Function],
        "version": "v2",
      }
    `);
  });

  it('should properly type the API factory', () => {
    const fooApi = createApiRef<{ foo: string }>({ id: 'foo' });
    const barApi = createApiRef<{ bar: string }>({ id: 'bar' });

    expect('test').not.toBe('failing without assertions');

    ApiBlueprint.make({
      params: define =>
        define({ api: fooApi, deps: {}, factory: () => ({ foo: 'foo' }) }),
    });

    ApiBlueprint.make({
      params: define =>
        define({
          api: fooApi,
          deps: {},
          // @ts-expect-error missing property
          factory: () => ({}),
        }),
    });

    ApiBlueprint.make({
      params: define =>
        define({
          api: fooApi,
          deps: {},
          // @ts-expect-error wrong property
          factory: () => ({
            bar: 'bar',
          }),
        }),
    });

    ApiBlueprint.make({
      params: define =>
        define({
          api: fooApi,
          deps: {},
          factory: () => ({
            // @ts-expect-error wrong type
            foo: 1,
          }),
        }),
    });

    ApiBlueprint.make({
      params: define =>
        define({
          api: fooApi,
          deps: { bar: barApi },
          factory: ({ bar }) => ({ foo: bar.bar }),
        }),
    });

    ApiBlueprint.make({
      params: define =>
        define({
          api: fooApi,
          deps: { bar: barApi },
          factory: ({ bar }) => ({
            // @ts-expect-error not an available property
            foo: bar.foo,
          }),
        }),
    });

    ApiBlueprint.make({
      params: define =>
        define({
          api: fooApi,
          deps: { bar: barApi },
          factory: ({ bar }) => ({
            // @ts-expect-error not an available property
            foo: bar.foo,
          }),
        }),
    });

    ApiBlueprint.make({
      params: define =>
        define({
          api: fooApi,
          deps: {},
          factory: ({ bar }) => ({
            // @ts-expect-error unknown dep
            foo: bar.bar,
          }),
        }),
    });
  });

  it('should create an extension with custom factory', () => {
    const api = createApiRef<{ foo: string }>({ id: 'test' });
    const factory = jest.fn(() => ({ foo: 'bar' }));

    const extension = ApiBlueprint.makeWithOverrides({
      config: {
        schema: {
          test: z => z.string().default('test'),
        },
      },
      inputs: {
        test: createExtensionInput([ApiBlueprint.dataRefs.factory]),
      },
      name: api.id,
      factory(originalFactory, { config: _config, inputs: _inputs }) {
        return originalFactory(define => define({ api, deps: {}, factory }));
      },
    });

    expect(extension).toMatchInlineSnapshot(`
      {
        "$$type": "@backstage/ExtensionDefinition",
        "T": undefined,
        "attachTo": {
          "id": "root",
          "input": "apis",
        },
        "configSchema": {
          "parse": [Function],
          "schema": {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "additionalProperties": false,
            "properties": {
              "test": {
                "default": "test",
                "type": "string",
              },
            },
            "type": "object",
          },
        },
        "disabled": false,
        "factory": [Function],
        "inputs": {
          "test": {
            "$$type": "@backstage/ExtensionInput",
            "config": {
              "optional": false,
              "singleton": false,
            },
            "extensionData": [
              [Function],
            ],
            "replaces": undefined,
          },
        },
        "kind": "api",
        "name": "test",
        "output": [
          [Function],
        ],
        "override": [Function],
        "toString": [Function],
        "version": "v2",
      }
    `);
  });
});
