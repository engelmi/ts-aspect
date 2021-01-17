export function getPointcutMethods(target: any, pointcut: string): string[] {
    const classFunctions = Object.getOwnPropertyNames(Object.getPrototypeOf(target))
        .filter(item => typeof target[item] === 'function' && item !== 'constructor')
        .filter(item => item.match(pointcut));
    const objectFunctions = Object.getOwnPropertyNames(target)
        .filter(item => typeof target[item] === 'function' && item !== 'constructor')
        .filter(item => item.match(pointcut));

    return [...new Set([...classFunctions, ...objectFunctions]).values()];
}
