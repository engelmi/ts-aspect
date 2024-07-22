import { mock } from 'jest-mock-extended';

import { Advice } from '../src/advice.enum';
import { Aspect, AspectContext } from '../src/aspect.interface';
import { addAspect } from '../src/addAspect';
import { CalculatorCls } from './samples/CalculatorCls.sample';

describe('addAspect', () => {
    let calculator: CalculatorCls;
    const aspect = mock<Aspect<number, [number, number]>>();

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

        calculator.subtract(1, 2);
        calculator.multiply(1, 2);

        expect(aspect.execute).not.toHaveBeenCalled();
    });

    it.each([Advice.Before, Advice.After, Advice.Around, Advice.TryFinally])(
        'should pass all parameters of the called function to the injected aspect',
        (advice: Advice) => {
            addAspect(calculator, 'add', advice, aspect);

            calculator.add(1, 2);

            const expectedCtx: AspectContext<number, [number, number]> = {
                target: calculator,
                methodName: 'add',
                functionParams: [1, 2],
                returnValue: 3,
                error: null,
            };
            expect(aspect.execute).toHaveBeenCalledWith(expectedCtx);
        },
    );

    it('should catch the error, pass the error and all function parameters to the injected aspect and execute it for Advice.TryCatch', () => {
        addAspect(calculator, 'divide', Advice.TryCatch, aspect);

        calculator.divide(1, 0);

        expect(aspect.execute).toHaveBeenCalledTimes(1);

        const expectedCtx: AspectContext<number, [number, number]> = {
            target: calculator,
            methodName: 'divide',
            functionParams: [1, 0],
            returnValue: null,
            error: new Error('Division by zero!'),
        };
        expect(aspect.execute).toHaveBeenCalledWith(expectedCtx);
    });

    it('should pass the returned value to the injected aspect for Advice.AfterReturn', () => {
        aspect.execute.mockImplementationOnce((ctx: AspectContext<number, [number, number]>) => {
            return ctx.returnValue;
        });

        addAspect(calculator, 'add', Advice.AfterReturn, aspect);

        calculator.add(1, 2);

        expect(aspect.execute).toHaveBeenCalledTimes(1);

        const expectedCtx: AspectContext<number, [number, number]> = {
            target: calculator,
            methodName: 'add',
            functionParams: [1, 2],
            returnValue: 3,
            error: null,
        };
        expect(aspect.execute).toHaveBeenCalledWith(expectedCtx);
    });

    it('should return the returned value manipulated by the injected aspect for Advice.AfterReturn', () => {
        aspect.execute.mockImplementationOnce((ctx: AspectContext<number, [number, number]>) => {
            const returnValue = ctx.returnValue;
            if (returnValue === null) {
                return null;
            }
            return returnValue * 42;
        });

        addAspect(calculator, 'add', Advice.AfterReturn, aspect);

        const returnValue = calculator.add(1, 2);

        expect(returnValue).toBe(3 * 42);
    });

    it('should execute all injected aspects for the same advice and pointcut', () => {
        const secondAspect = mock<Aspect<number, [number, number]>>();
        const thirdAspect = mock<Aspect<number, [number, number]>>();

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

    describe('for async functions', () => {
        class SampleClassAsync {
            public constructor(public sampleId: number) {
                this.sampleId = sampleId;
            }

            public async getSampleIdAsync(): Promise<number> {
                return this.sampleId;
            }
        }

        const aspect = mock<Aspect<number, [number, number]>>();
        aspect.execute.mockImplementation((ctx: AspectContext<number, [number, number]>) => {
            return 42;
        });

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it.each([
            [Advice.Before, 1, 1337, 1337],
            [Advice.After, 1, 1337, 1337],
            [Advice.AfterReturn, 1, 1337, 42],
            [Advice.Around, 2, 1337, 1337],
            [Advice.TryCatch, 0, 1337, 1337],
            [Advice.TryFinally, 1, 1337, 1337],
        ])(
            'should execute the aspect at the advice %s annotated %d times',
            async (
                advice: Advice,
                numberOfCalls: number,
                initialSampleId: number,
                expectedReturnSampleId: number,
            ) => {
                const cls = new SampleClassAsync(initialSampleId);
                addAspect(cls, 'getSampleIdAsync', advice, aspect);

                const sampleId = await cls.getSampleIdAsync();

                expect(aspect.execute).toHaveBeenCalledTimes(numberOfCalls);
                expect(sampleId).toBe(expectedReturnSampleId);
            },
        );
    });
});
