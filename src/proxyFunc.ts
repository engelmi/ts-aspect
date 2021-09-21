import { Advice } from './advice.enum';
import { MethodContainer } from './TsAspectContainer';

export const proxyFunc = (target: any, methodContainer: MethodContainer, ...args: any): any => {
    const { originalMethod, adviceAspectMap } = methodContainer;
    let returnedValue: any = undefined;
    let modifiedArgs: any = undefined;

    if (adviceAspectMap.has(Advice.Before)) {
        adviceAspectMap.get(Advice.Before)?.forEach(aspect => {
            modifiedArgs = aspect.execute(target, args);
        });
    }

    if (adviceAspectMap.has(Advice.Around)) {
        adviceAspectMap.get(Advice.Around)?.forEach(aspect => {
            modifiedArgs = aspect.execute(target, args);
        });
    }

    try {
        returnedValue = originalMethod.apply(target, modifiedArgs ?? args);
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
            returnedValue = aspect.execute(target, [returnedValue, args]);
        });
    }

    return returnedValue;
}
