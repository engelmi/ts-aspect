import { Advice } from './advice.enum';
import { AspectContext } from './aspect.interface';
import { AdviceAspectMap, MethodContainer } from './TsAspectContainer';

export async function asyncProxyFunc(
    target: any,
    methodName: string,
    methodContainer: MethodContainer,
    ...args: any
): Promise<any> {
    const { originalMethod, adviceAspectMap } = methodContainer;
    const aspectCtx: AspectContext = {
        target: target,
        methodName: methodName,
        functionParams: args,
        returnValue: null,
        error: null,
    };

    applyPreExecutionAspects(aspectCtx, adviceAspectMap);

    try {
        aspectCtx.returnValue = await originalMethod.apply(target, args);
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

    applyPostExecutionAspects(aspectCtx, adviceAspectMap);

    return aspectCtx.returnValue;
}

export function proxyFunc(
    target: any,
    methodName: string,
    methodContainer: MethodContainer,
    ...args: any
): any {
    const { originalMethod, adviceAspectMap } = methodContainer;
    const aspectCtx: AspectContext = {
        target: target,
        methodName: methodName,
        functionParams: args,
        returnValue: null,
        error: null,
    };

    applyPreExecutionAspects(aspectCtx, adviceAspectMap);

    try {
        aspectCtx.returnValue = originalMethod.apply(target, args);
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

    applyPostExecutionAspects(aspectCtx, adviceAspectMap);

    return aspectCtx.returnValue;
}

function applyPreExecutionAspects(
    aspectCtx: AspectContext,
    adviceAspectMap: AdviceAspectMap,
): void {
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
}

function applyPostExecutionAspects(
    aspectCtx: AspectContext,
    adviceAspectMap: AdviceAspectMap,
): void {
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
            aspectCtx.returnValue = aspect.execute(aspectCtx);
        });
    }
}
