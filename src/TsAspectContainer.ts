import { Advice } from './advice.enum';
import { Aspect } from './aspect.interface';

type AdviceAspectMap<Data, Args> = Map<Advice, Aspect<Data, Args>[]>;
type MethodContainer<Data, Args> = {
    originalMethod: any;
    adviceAspectMap: AdviceAspectMap<Data, Args>;
};
type TsAspectContainer = Record<string, MethodContainer<any, any>>;

export { TsAspectContainer, MethodContainer, AdviceAspectMap };
