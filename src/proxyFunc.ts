import { Advice } from './advice.enum';
import { MethodContainer } from './TsAspectContainer';

export function proxyFunc(target: any, methodContainer: MethodContainer, ...args: any): any {
    const { originalMethod, adviceAspectMap } = methodContainer;

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
        } else {
            throw error;
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
            returnedValue = aspect.execute(target, [args, returnedValue]);
        });
    }

    return returnedValue;
}
