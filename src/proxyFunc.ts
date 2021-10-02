import { Advice } from './advice.enum';
import { AspectContext } from './aspect.interface';
import { MethodContainer } from './TsAspectContainer';

export function proxyFunc(target: any, methodContainer: MethodContainer, ...args: any): any {
    const { originalMethod, adviceAspectMap } = methodContainer;
    const aspectCtx: AspectContext = {
        target: target,
        functionParams: args,
        returnValue: null,
        error: null,
    };

    if (adviceAspectMap.has(Advice.Before)) {
        adviceAspectMap.get(Advice.Before)?.forEach(aspect => {
            aspect.execute(aspectCtx);
        });
    }
    if (adviceAspectMap.has(Advice.Around)) {
        adviceAspectMap.get(Advice.Around)?.forEach(aspect => {
            aspect.execute(aspectCtx);
        });
    }

    let returnedValue: any;
    try {
        returnedValue = originalMethod.apply(target, args);
    } catch (error) {
        if (adviceAspectMap.has(Advice.TryCatch)) {
            adviceAspectMap.get(Advice.TryCatch)?.forEach(aspect => {
                aspectCtx.error = error;
                aspect.execute(aspectCtx);
            });
        } else {
            throw error;
        }
    } finally {
        if (adviceAspectMap.has(Advice.TryFinally)) {
            adviceAspectMap.get(Advice.TryFinally)?.forEach(aspect => {
                aspect.execute(aspectCtx);
            });
        }
    }

    if (adviceAspectMap.has(Advice.Around)) {
        adviceAspectMap.get(Advice.Around)?.forEach(aspect => {
            aspect.execute(aspectCtx);
        });
    }

    if (adviceAspectMap.has(Advice.After)) {
        adviceAspectMap.get(Advice.After)?.forEach(aspect => {
            aspect.execute(aspectCtx);
        });
    }

    if (adviceAspectMap.has(Advice.AfterReturn)) {
        adviceAspectMap.get(Advice.AfterReturn)?.forEach(aspect => {
            aspectCtx.returnValue = returnedValue;
            returnedValue = aspect.execute(aspectCtx);
        });
    }

    return returnedValue;
}
