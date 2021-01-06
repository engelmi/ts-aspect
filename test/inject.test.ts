import { Advice } from '../src/advice';
import { inject } from '../src/index';
import { getFunctionList } from '../src/inject';

class CalculatorCls {
    public add(a: number, b: number): number {
        return a + b;
    }

    public substract(a: number, b: number): number {
        return a - b;
    }

    public multiply(a: number, b: number): number {
        return a * b;
    }

    public divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error('Division by zero!');
        }
        return a / b;
    }
}

const CalculatorObj = {
    add: (a: number, b: number): number => {
        return a + b;
    },
    substract: (a: number, b: number): number => {
        return a - b;
    },
    multiply: (a: number, b: number): number => {
        return a * b;
    },
    divide: (a: number, b: number): number => {
        if (b === 0) {
            throw new Error('Division by zero!');
        }
        return a / b;
    },
};

describe('inject', () => {
    describe('getFunctionList', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('returns list of all functions from object', () => {
            const functions = getFunctionList(CalculatorObj);

            expect(functions).toStrictEqual([
                'constructor',
                '__defineGetter__',
                '__defineSetter__',
                'hasOwnProperty',
                '__lookupGetter__',
                '__lookupSetter__',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'toString',
                'valueOf',
                'toLocaleString',
                'add',
                'substract',
                'multiply',
                'divide',
            ]);
        });

        it('returns list of all functions from class instance', () => {
            const calculator = new CalculatorCls();

            const functions = getFunctionList(calculator);

            expect(functions).toStrictEqual([
                'constructor',
                'add',
                'substract',
                'multiply',
                'divide',
            ]);
        });
    });

    describe('injectAspect', () => {
        const aspect = jest.fn().mockImplementation(() => {});

        beforeEach(() => {
            jest.clearAllMocks();
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
                const calculator = new CalculatorCls();

                inject(calculator, aspect, advice, 'add');

                calculator.add(1, 2);

                expect(aspect).toHaveBeenCalledTimes(expectedNumberOfCalls);
            },
        );

        it.each([
            Advice.Before,
            Advice.After,
            Advice.AfterReturn,
            Advice.Around,
            Advice.TryCatch,
            Advice.TryFinally,
        ])(
            'should not execute the injected aspect if other methods are called',
            (advice: Advice) => {
                const calculator = new CalculatorCls();

                inject(calculator, aspect, advice, 'add');
                inject(calculator, aspect, advice, 'divide');

                calculator.substract(1, 2);
                calculator.multiply(1, 2);

                expect(aspect).not.toHaveBeenCalled();
            },
        );

        it.each([Advice.Before, Advice.After, Advice.Around, Advice.TryFinally])(
            'should pass all parameters of the called function to the injected aspect',
            (advice: Advice) => {
                const calculator = new CalculatorCls();

                inject(calculator, aspect, advice, 'add');

                calculator.add(1, 2);

                expect(aspect).toHaveBeenCalledWith(1, 2);
            },
        );

        it('should catch the error, pass the error and all function parameters to the injected aspect and execute it for Advice.TryCatch', () => {
            const calculator = new CalculatorCls();

            inject(calculator, aspect, Advice.TryCatch, 'divide');

            calculator.divide(1, 0);

            expect(aspect).toHaveBeenCalledTimes(1);
            expect(aspect).toHaveBeenCalledWith(new Error('Division by zero!'), 1, 0);
        });

        it('should pass the returned value to the injected aspect for Advice.AfterReturn', () => {
            const calculator = new CalculatorCls();

            inject(calculator, aspect, Advice.AfterReturn, 'add');

            calculator.add(1, 2);

            expect(aspect).toHaveBeenCalledTimes(1);
            expect(aspect).toHaveBeenCalledWith(3);
        });

        it('should execute subsequent injected aspects for the same method two times', () => {
            const secondAspect = jest.fn().mockImplementation(() => {});
            const thirdAspect = jest.fn().mockImplementation(() => {});

            const calculator = new CalculatorCls();

            inject(calculator, aspect, Advice.Before, 'add');
            inject(calculator, secondAspect, Advice.Before, 'add');
            inject(calculator, thirdAspect, Advice.Before, 'add');

            calculator.add(1, 2);

            expect(aspect).toHaveBeenCalledTimes(1);
            expect(secondAspect).toHaveBeenCalledTimes(2);
            expect(thirdAspect).toHaveBeenCalledTimes(2);
        });
    });
});
