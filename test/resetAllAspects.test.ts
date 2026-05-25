import { mock } from 'jest-mock-extended';

import { Advice } from '../src/advice.enum';
import { Aspect } from '../src/aspect.interface';
import { addAspect } from '../src/addAspect';
import { resetAllAspects } from '../src/resetAllAspects';
import { CalculatorCls } from './samples/CalculatorCls.sample';

describe('resetAllAspects', () => {
    let calculator: CalculatorCls;
    const aspect = mock<Aspect<number, [number, number]>>();

    beforeEach(() => {
        jest.clearAllMocks();

        calculator = new CalculatorCls();
    });

    it('should clear all registered aspects', () => {
        addAspect(calculator, 'add', Advice.Before, aspect);

        calculator.add(1, 2);

        resetAllAspects(calculator, 'add');

        calculator.add(4, 4);

        expect(aspect.execute).toHaveBeenCalledTimes(1);
    });
});
