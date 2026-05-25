import { types } from 'util';
import { getTsAspectProp, setTsAspectProp } from '../TsAspectProperty';
import { Advice } from '../advice.enum';
import { Aspect } from '../aspect.interface';
import { asyncProxyFunc, proxyFunc } from '../proxyFunc';

export function UseAspect<T extends (...args: any[]) => any>(
    advice: Advice,
    aspect:
        | Aspect<Awaited<ReturnType<T>>, Parameters<T>>
        | (new () => Aspect<Awaited<ReturnType<T>>, Parameters<T>>),
) {
    return (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
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
                adviceAspectMap: new Map<Advice, Aspect<Awaited<ReturnType<T>>, Parameters<T>>[]>(),
            };

            descriptor.value = function (...args: any): any {
                const tsAspectProp = getTsAspectProp(target);
                if (tsAspectProp) {
                    if (types.isAsyncFunction(originalMethod)) {
                        return asyncProxyFunc(
                            this,
                            propertyKeyString,
                            tsAspectProp[propertyKeyString],
                            ...args,
                        );
                    } else {
                        return proxyFunc(
                            this,
                            propertyKeyString,
                            tsAspectProp[propertyKeyString],
                            ...args,
                        );
                    }
                }
                return originalMethod?.(...args);
            } as T;
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
