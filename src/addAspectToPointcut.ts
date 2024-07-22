import { addAspect } from './addAspect';
import { Advice } from './advice.enum';
import { Aspect } from './aspect.interface';
import { getPointcutMethods } from './getPointcutMethods';

export function addAspectToPointcut<Data, Args>(
    target: any,
    pointcut: string,
    advice: Advice,
    aspect: Aspect<Data, Args>,
): void {
    const methods = getPointcutMethods(target, pointcut);
    methods.forEach(method => {
        addAspect(target, method, advice, aspect);
    });
}
