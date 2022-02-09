import { getPointcutMethods } from '../src/getPointcutMethods';
import { CalculatorCls } from './samples/CalculatorCls.sample';
import { CalculatorObj } from './samples/CalculatorObj.sample';

describe('getPointcutMethods', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns list of all methods from object for pointcut ".*" without constructor', () => {
        const methods = getPointcutMethods(CalculatorObj, '.*');

        expect(methods).toStrictEqual([
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
            'subtract',
            'multiply',
            'divide',
        ]);
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
});
