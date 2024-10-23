import { M as ModuleMockerInterceptor, a as ModuleMockerCompilerHints, b as ModuleMocker } from './hints-D217dt6d.js';
import './types-yDMq238q.js';
import '@vitest/spy';

declare function registerModuleMocker(interceptor: (accessor: string) => ModuleMockerInterceptor): ModuleMockerCompilerHints;
declare function registerNativeFactoryResolver(mocker: ModuleMocker): void;

export { registerModuleMocker, registerNativeFactoryResolver };
