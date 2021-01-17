import { Advice } from './advice.enum';
import { Aspect } from './aspect.interface';
import { createProxyFunc } from './createProxyFunc';
import { setTsAspectProp, getTsAspectProp } from './TsAspectProperty';

export function addAspect(target: any, methodName: string, advice: Advice, aspect: Aspect): void {
    let tsAspectProp = getTsAspectProp(target);
    if (!tsAspectProp) {
        tsAspectProp = {};
        setTsAspectProp(target, tsAspectProp);
    }

    if (!tsAspectProp[methodName]) {
        tsAspectProp[methodName] = {
            originalMethod: Reflect.get(target, methodName),
            adviceAspectMap: new Map<Advice, Aspect[]>(),
        };

        const proxyMethod = createProxyFunc(target, tsAspectProp[methodName]);
        Reflect.set(target, methodName, proxyMethod);
    }

    const { adviceAspectMap } = tsAspectProp[methodName];
    if (!adviceAspectMap.has(advice)) {
        adviceAspectMap.set(advice, []);
    }
    adviceAspectMap.get(advice)?.push(aspect);
}
