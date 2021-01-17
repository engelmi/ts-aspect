import { Advice } from './advice.enum';
import { Aspect } from './aspect.interface';

type AdviceAspectMap = Map<Advice, Aspect[]>;
type MethodContainer = {
    originalMethod: any;
    adviceAspectMap: AdviceAspectMap;
};
type TsAspectContainer = Record<string, MethodContainer>;

export { TsAspectContainer, MethodContainer, AdviceAspectMap };
