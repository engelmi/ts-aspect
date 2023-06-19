import { getPointcutMethods } from '../src/getPointcutMethods';
import { CalculatorCls, AdvancedCalculatorCls } from './samples/CalculatorCls.sample';
import { CalculatorObj } from './samples/CalculatorObj.sample';

describe('getPointcutMethods', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns list of all methods from object for pointcut ".*" without constructor', () => {
        const methods = getPointcutMethods(CalculatorObj, '.*');

        expect(methods).toStrictEqual(['add', 'subtract', 'multiply', 'divide']);
    });

    it('returns list of all methods from class instance for pointcut ".*" without constructor', () => {
        const calculator = new CalculatorCls();

        const methods = getPointcutMethods(calculator, '.*');

        expect(methods).toStrictEqual(['add', 'subtract', 'multiply', 'divide']);
    });

    it('returns list of methods from class instance matching pointcut "add"', () => {
        const calculator = new CalculatorCls();

        const methods = getPointcutMethods(calculator, 'add');

        expect(methods).toStrictEqual(['add']);
    });

    it('returns list of methods from child class instance for pointcut ".*" including inherited methods', () => {
        const calculator = new AdvancedCalculatorCls();

        const methods = getPointcutMethods(calculator, '.*');

        expect(methods).toStrictEqual(['sum', 'add', 'subtract', 'multiply', 'divide']);
    });
});
