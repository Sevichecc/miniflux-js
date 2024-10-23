import { M as ModuleMockerInterceptor } from './hints-D217dt6d.js';
export { C as CompilerHintsOptions, b as ModuleMocker, a as ModuleMockerCompilerHints, d as ModuleMockerConfig, c as ModuleMockerRPC, R as ResolveIdResult, e as ResolveMockResul, f as createCompilerHints } from './hints-D217dt6d.js';
import { StartOptions, SetupWorker } from 'msw/browser';
import { a as MockerRegistry, d as MockedModule } from './types-yDMq238q.js';
import '@vitest/spy';

interface ModuleMockerMSWInterceptorOptions {
    /**
     * The identifier to access the globalThis object in the worker.
     * This will be injected into the script as is, so make sure it's a valid JS expression.
     * @example
     * ```js
     * // globalThisAccessor: '__my_variable__' produces:
     * globalThis[__my_variable__]
     * // globalThisAccessor: 'Symbol.for('secret:mocks')' produces:
     * globalThis[Symbol.for('secret:mocks')]
     * // globalThisAccessor: '"__vitest_mocker__"' (notice quotes) produces:
     * globalThis["__vitest_mocker__"]
     * ```
     * @default `"__vitest_mocker__"`
     */
    globalThisAccessor?: string;
    /**
     * Options passed down to `msw.setupWorker().start(options)`
     */
    mswOptions?: StartOptions;
    /**
     * A pre-configured `msw.setupWorker` instance.
     */
    mswWorker?: SetupWorker;
}
declare class ModuleMockerMSWInterceptor implements ModuleMockerInterceptor {
    private readonly options;
    protected readonly mocks: MockerRegistry;
    private started;
    private startPromise;
    constructor(options?: ModuleMockerMSWInterceptorOptions);
    register(module: MockedModule): Promise<void>;
    delete(url: string): Promise<void>;
    invalidate(): void;
    private resolveManualMock;
    protected init(): Promise<unknown>;
}

declare class ModuleMockerServerInterceptor implements ModuleMockerInterceptor {
    register(module: MockedModule): Promise<void>;
    delete(id: string): Promise<void>;
    invalidate(): void;
}

export { ModuleMockerInterceptor, ModuleMockerMSWInterceptor, type ModuleMockerMSWInterceptorOptions, ModuleMockerServerInterceptor };
