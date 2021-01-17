import { Advice } from './advice.enum';
import { MethodContainer } from './TsAspectContainer';

export function createProxyFunc(target: any, methodContainer: MethodContainer): any {
    const { originalMethod, adviceAspectMap } = methodContainer;

    return (...args: any) => {
        if (adviceAspectMap.has(Advice.Before)) {
            adviceAspectMap.get(Advice.Before)?.forEach(aspect => {
                aspect.execute(target, args);
            });
        }
        if (adviceAspectMap.has(Advice.Around)) {
            adviceAspectMap.get(Advice.Around)?.forEach(aspect => {
                aspect.execute(target, args);
            });
        }

        let returnedValue: any;
        try {
            returnedValue = originalMethod.apply(target, args);
        } catch (error) {
            if (adviceAspectMap.has(Advice.TryCatch)) {
                adviceAspectMap.get(Advice.TryCatch)?.forEach(aspect => {
                    aspect.execute(target, [error, ...args]);
                });
            }
        } finally {
            if (adviceAspectMap.has(Advice.TryFinally)) {
                adviceAspectMap.get(Advice.TryFinally)?.forEach(aspect => {
                    aspect.execute(target, args);
                });
            }
        }

        if (adviceAspectMap.has(Advice.Around)) {
            adviceAspectMap.get(Advice.Around)?.forEach(aspect => {
                aspect.execute(target, args);
            });
        }

        if (adviceAspectMap.has(Advice.After)) {
            adviceAspectMap.get(Advice.After)?.forEach(aspect => {
                aspect.execute(target, args);
            });
        }

        if (adviceAspectMap.has(Advice.AfterReturn)) {
            adviceAspectMap.get(Advice.AfterReturn)?.forEach(aspect => {
                returnedValue = aspect.execute(target, [returnedValue]);
            });
        }

        return returnedValue;
    };
}
