export function getPointcutMethods(target: any, pointcut: string): string[] {
    const unique_method_names = new Set<string>();

    let current_target = target;
    while (current_target !== null && current_target !== undefined) {
        const next_target = Object.getPrototypeOf(current_target);
        if (next_target === null || next_target === undefined) {
            break;
        }
        Object.getOwnPropertyNames(current_target)
            .filter(item => typeof current_target[item] === 'function' && item !== 'constructor')
            .filter(item => item.match(pointcut))
            .forEach(item => {
                unique_method_names.add(item);
            });

        current_target = next_target;
    }

    return [...unique_method_names.values()];
}
