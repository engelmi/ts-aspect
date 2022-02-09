import { Advice } from './advice.enum';
import { Aspect, AspectContext } from './aspect.interface';
import { addAspect } from './addAspect';
import { addAspectToPointcut } from './addAspectToPointcut';
import { resetAllAspects } from './resetAllAspects';
import { UseAspect } from './decorator/UseAspect';

export {
    Advice,
    Aspect,
    AspectContext,
    addAspect,
    addAspectToPointcut,
    resetAllAspects,
    UseAspect,
};
