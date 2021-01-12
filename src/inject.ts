import { Advice } from './advice';

function getFunctionList(obj: any): string[] {
    const classFunctions = Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(
        item => typeof obj[item] === 'function',
    );
    const objectFunctions = Object.getOwnPropertyNames(obj).filter(
        item => typeof obj[item] === 'function',
    );

    return [...classFunctions, ...objectFunctions];
}

function injectAspect(target: any, aspect: any, advice: Advice, functionName: string): void {
    const originalCode = Reflect.get(target, functionName);
    if (originalCode) {
        const wrappedFunction = (...args: any[]) => {
            if ([Advice.Before, Advice.Around].includes(advice)) {
                aspect.apply(target, args);
            }

            let returnedValue;
            try {
                returnedValue = originalCode.apply(target, args);
            } catch (error) {
                if (advice === Advice.TryCatch) {
                    aspect.apply(target, [error, ...args]);
                }
            } finally {
                if (advice === Advice.TryFinally) {
                    aspect.apply(target, args);
                }
            }

            if ([Advice.After, Advice.Around].includes(advice)) {
                aspect.apply(target, args);
            }

            if (advice === Advice.AfterReturn) {
                return aspect.apply(target, [returnedValue]);
            }

            return returnedValue;
        };
        Reflect.set(target, functionName, wrappedFunction);
    }
}

export { getFunctionList, injectAspect };
