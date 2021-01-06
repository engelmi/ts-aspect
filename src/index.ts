import { Advice } from './advice';
import { getFunctionList, injectAspect } from './inject';

function inject(target: any, aspect: any, advice: Advice, pointcut: string): void {
    const methods = getFunctionList(target);
    methods.forEach(method => {
        if (method.match(pointcut)) {
            injectAspect(target, aspect, advice, method);
        }
    });
}

export { inject, Advice };
