import { types } from 'util';
import { Advice } from './advice.enum';
import { Aspect } from './aspect.interface';
import { proxyFunc, asyncProxyFunc } from './proxyFunc';
import { setTsAspectProp, getTsAspectProp } from './TsAspectProperty';

export function addAspect(target: any, methodName: string, advice: Advice, aspect: Aspect): void {
    let tsAspectProp = getTsAspectProp(target);
    if (!tsAspectProp) {
        tsAspectProp = {};
        setTsAspectProp(target, tsAspectProp);
    }

    if (!tsAspectProp[methodName]) {
        const originalMethod = Reflect.get(target, methodName);

        tsAspectProp[methodName] = {
            originalMethod,
            adviceAspectMap: new Map<Advice, Aspect[]>(),
        };

        const wrapperFunc = function (...args: any): any {
            const tsAspectProp = getTsAspectProp(target);
            if (tsAspectProp) {
                if (types.isAsyncFunction(originalMethod)) {
                    return asyncProxyFunc(target, methodName, tsAspectProp[methodName], ...args);
                } else {
                    return proxyFunc(target, methodName, tsAspectProp[methodName], ...args);
                }
            }
            return originalMethod(...args);
        };
        Reflect.set(target, methodName, wrapperFunc);
    }

    const { adviceAspectMap } = tsAspectProp[methodName];
    if (!adviceAspectMap.has(advice)) {
        adviceAspectMap.set(advice, []);
    }
    adviceAspectMap.get(advice)?.push(aspect);
}
