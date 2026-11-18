/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * lazyWithRetry: React.lazy con reintentos de red y recuperación real tras fallo.
 *
 * React.lazy cachea las promesas rechazadas; este wrapper:
 *   1. Reintenta la importación dinámica hasta `retries` veces con backoff.
 *   2. Si todos los intentos fallan, al remontar el árbol desde ErrorBoundary
 *      construye un React.lazy nuevo para reintentar la descarga del chunk.
 */
import {
  lazy,
  useState,
  type ComponentProps,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModuleFactory<T extends ComponentType<any>> = () => Promise<{ default: T }>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: ModuleFactory<T>,
  retries = 2,
  delayMs = 500,
): ComponentType<ComponentProps<T>> {
  let failed = false;

  const build = (): LazyExoticComponent<T> =>
    lazy(async () => {
      let lastError: unknown;
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const loaded = await factory();
          failed = false;
          return loaded;
        } catch (error) {
          lastError = error;
          if (attempt < retries) {
            await sleep(delayMs * (attempt + 1));
          }
        }
      }
      failed = true;
      throw lastError;
    });

  let shared = build();

  const RetryLazy = (props: ComponentProps<T>) => {
    const [Inner] = useState<LazyExoticComponent<T>>(() => {
      if (failed) {
        failed = false;
        shared = build();
      }
      return shared;
    });
    const LazyComponent = Inner as ComponentType<ComponentProps<T>>;
    return <LazyComponent {...props} />;
  };

  RetryLazy.displayName = `LazyWithRetry(${factory.name || 'component'})`;
  return RetryLazy;
}
