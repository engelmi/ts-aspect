import { Advice } from './advice.enum';
import { Aspect } from './aspect.interface';
import { proxyFunc } from './proxyFunc';
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

        const proxyMethod = function (...args: any): any {
            const tsAspectProp = getTsAspectProp(target);
            if (tsAspectProp) {
                return proxyFunc(target, tsAspectProp[methodName], ...args);
            }
            return originalMethod(...args);
        };
        Reflect.set(target, methodName, proxyMethod);
    }

    const { adviceAspectMap } = tsAspectProp[methodName];
    if (!adviceAspectMap.has(advice)) {
        adviceAspectMap.set(advice, []);
    }
    adviceAspectMap.get(advice)?.push(aspect);
}
