import { mock } from 'jest-mock-extended';

import { Advice } from '../src/advice.enum';
import { Aspect } from '../src/aspect.interface';
import { addAspect } from '../src/addAspect';
import { CalculatorCls } from './samples/CalculatorCls.sample';

describe('addAspect', () => {
    let calculator: CalculatorCls;
    const aspect = mock<Aspect>();

    beforeEach(() => {
        jest.clearAllMocks();

        calculator = new CalculatorCls();
    });

    it('should add TsAspectObject as property', () => {
        addAspect(calculator, 'add', Advice.Before, aspect);

        expect(Object.getOwnPropertyNames(calculator)).toContain('ts_aspect_obj');
    });

    it.each([
        [Advice.Before, 1],
        [Advice.After, 1],
        [Advice.AfterReturn, 1],
        [Advice.Around, 2],
        [Advice.TryCatch, 0],
        [Advice.TryFinally, 1],
    ])(
        'should execute the injected aspect as often as the respective advice %s demands',
        (advice: Advice, expectedNumberOfCalls: number) => {
            addAspect(calculator, 'add', advice, aspect);

            calculator.add(1, 2);

            expect(aspect.execute).toHaveBeenCalledTimes(expectedNumberOfCalls);
        },
    );

    it.each([
        Advice.Before,
        Advice.After,
        Advice.AfterReturn,
        Advice.Around,
        Advice.TryCatch,
        Advice.TryFinally,
    ])('should not execute the injected aspect if other methods are called', (advice: Advice) => {
        addAspect(calculator, 'add', advice, aspect);
        addAspect(calculator, 'divide', advice, aspect);

        calculator.substract(1, 2);
        calculator.multiply(1, 2);

        expect(aspect.execute).not.toHaveBeenCalled();
    });

    it.each([Advice.Before, Advice.After, Advice.Around, Advice.TryFinally])(
        'should pass all parameters of the called function to the injected aspect',
        (advice: Advice) => {
            addAspect(calculator, 'add', advice, aspect);

            calculator.add(1, 2);

            expect(aspect.execute).toHaveBeenCalledWith(calculator, [1, 2]);
        },
    );

    it('should catch the error, pass the error and all function parameters to the injected aspect and execute it for Advice.TryCatch', () => {
        addAspect(calculator, 'divide', Advice.TryCatch, aspect);

        calculator.divide(1, 0);

        expect(aspect.execute).toHaveBeenCalledTimes(1);
        expect(aspect.execute).toHaveBeenCalledWith(calculator, [
            new Error('Division by zero!'),
            1,
            0,
        ]);
    });

    it('should pass the returned value to the injected aspect for Advice.AfterReturn', () => {
        addAspect(calculator, 'add', Advice.AfterReturn, aspect);

        calculator.add(1, 2);

        expect(aspect.execute).toHaveBeenCalledTimes(1);
        expect(aspect.execute).toHaveBeenCalledWith(calculator, [[1, 2], 3]);
    });

    it('should return the returned value manipulated by the injected aspect for Advice.AfterReturn', () => {
        aspect.execute.mockImplementationOnce((target: any, args: any[]) => {
            const returnValue = args[1];
            return returnValue * 42;
        });

        addAspect(calculator, 'add', Advice.AfterReturn, aspect);

        const returnValue = calculator.add(1, 2);

        expect(returnValue).toBe(3 * 42);
    });

    it('should execute all injected aspects for the same advice and pointcut', () => {
        const secondAspect = mock<Aspect>();
        const thirdAspect = mock<Aspect>();

        addAspect(calculator, 'add', Advice.Before, aspect);

        calculator.add(1, 2);

        expect(aspect.execute).toHaveBeenCalledTimes(1);

        addAspect(calculator, 'add', Advice.After, secondAspect);
        addAspect(calculator, 'add', Advice.Before, thirdAspect);

        calculator.add(4, 4);

        expect(aspect.execute).toHaveBeenCalledTimes(2);
        expect(secondAspect.execute).toHaveBeenCalledTimes(1);
        expect(thirdAspect.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate thrown error in original method', () => {
        expect(() => calculator.divide(1, 0)).toThrow(Error);
    });
});
