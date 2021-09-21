import { Advice } from '../advice.enum';
import { Aspect } from '../aspect.interface';
import { proxyFunc } from '../proxyFunc';
import { getTsAspectProp, setTsAspectProp } from '../TsAspectProperty';

export const UseAspect = (advice: Advice, aspect: Aspect | (new () => Aspect), ...parameters: any[]): MethodDecorator => {
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

        const aspectObj = typeof aspect === 'function' ? new aspect() : aspect;
        aspectObj.parameters = parameters ?? [];

        adviceAspectMap.get(advice)?.push(aspectObj);
    };
}
