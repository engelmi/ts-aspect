import { TsAspectContainer } from './TsAspectContainer';

const tsAspectPropName = 'ts_aspect_obj';

function getTsAspectProp(target: any): TsAspectContainer | undefined {
    return Reflect.get(target, tsAspectPropName);
}

function setTsAspectProp(target: any, tsAspectProp: TsAspectContainer): boolean {
    return Reflect.set(target, tsAspectPropName, tsAspectProp);
}

export { setTsAspectProp, getTsAspectProp };
