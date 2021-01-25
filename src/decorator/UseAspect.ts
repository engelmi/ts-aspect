import { Advice } from '../advice.enum';
import { Aspect } from '../aspect.interface';
import { proxyFunc } from '../proxyFunc';
import { getTsAspectProp, setTsAspectProp } from '../TsAspectProperty';

export function UseAspect(advice: Advice, aspect: Aspect | (new () => Aspect)): MethodDecorator {
    return function (target, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        let tsAspectProp = getTsAspectProp(target);
        if (!tsAspectProp) {
            tsAspectProp = {};
            setTsAspectProp(target, tsAspectProp);
        }

        const propertyKeyString = propertyKey.toString();

        if (!tsAspectProp[propertyKeyString]) {
            const originalMethod = descriptor.value;

            tsAspectProp[propertyKeyString] = {
                originalMethod,
                adviceAspectMap: new Map<Advice, Aspect[]>(),
            };

            descriptor.value = function (...args: any): any {
                const tsAspectProp = getTsAspectProp(target);
                if (tsAspectProp) {
                    return proxyFunc(this, tsAspectProp[propertyKeyString], ...args);
                }
                return originalMethod(...args);
            };
        }

        const { adviceAspectMap } = tsAspectProp[propertyKeyString];
        if (!adviceAspectMap.has(advice)) {
            adviceAspectMap.set(advice, []);
        }
        if (typeof aspect === 'function') {
            adviceAspectMap.get(advice)?.push(new aspect());
        } else {
            adviceAspectMap.get(advice)?.push(aspect);
        }
    };
}
