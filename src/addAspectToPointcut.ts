import { addAspect } from './addAspect';
import { Advice } from './advice.enum';
import { Aspect } from './aspect.interface';
import { getPointcutMethods } from './getPointcutMethods';

export function addAspectToPointcut(
    target: any,
    pointcut: string,
    aspect: Aspect,
    advice: Advice,
): void {
    const methods = getPointcutMethods(target, pointcut);
    methods.forEach(method => {
        addAspect(target, method, advice, aspect);
    });
}
