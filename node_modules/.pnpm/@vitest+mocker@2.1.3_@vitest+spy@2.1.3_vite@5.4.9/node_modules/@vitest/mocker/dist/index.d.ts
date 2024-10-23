import { M as MockedModuleType } from './types-yDMq238q.js';
export { A as AutomockedModule, f as AutomockedModuleSerialized, c as AutospiedModule, g as AutospiedModuleSerialized, b as ManualMockedModule, i as ManualMockedModuleSerialized, d as MockedModule, e as MockedModuleSerialized, a as MockerRegistry, j as ModuleMockFactory, k as ModuleMockFactoryWithHelper, l as ModuleMockOptions, R as RedirectedModule, h as RedirectedModuleSerialized } from './types-yDMq238q.js';

type Key = string | symbol;
interface MockObjectOptions {
    type: MockedModuleType;
    globalConstructors: GlobalConstructors;
    spyOn: (obj: any, prop: Key) => any;
}
declare function mockObject(options: MockObjectOptions, object: Record<Key, any>, mockExports?: Record<Key, any>): Record<Key, any>;
interface GlobalConstructors {
    Object: ObjectConstructor;
    Function: FunctionConstructor;
    RegExp: RegExpConstructor;
    Array: ArrayConstructor;
    Map: MapConstructor;
}

export { type GlobalConstructors, type MockObjectOptions, MockedModuleType, mockObject };
