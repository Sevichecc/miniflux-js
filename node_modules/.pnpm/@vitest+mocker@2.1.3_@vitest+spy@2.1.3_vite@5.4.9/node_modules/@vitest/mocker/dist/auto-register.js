import { M as ModuleMockerServerInterceptor } from './chunk-interceptor-native.js';
import { registerModuleMocker } from './register.js';
import './chunk-hints.js';
import './chunk-registry.js';
import './index.js';
import './chunk-pathe.ff20891b.js';
import '@vitest/spy';

registerModuleMocker(
  () => new ModuleMockerServerInterceptor()
);
