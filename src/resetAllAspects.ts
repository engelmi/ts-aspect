import { getTsAspectProp } from './TsAspectProperty';

export function resetAllAspects(target: any, methodName: string): void {
    const tsAspectProp = getTsAspectProp(target);
    if (tsAspectProp && tsAspectProp[methodName]) {
        tsAspectProp[methodName].adviceAspectMap.clear();
    }
}
