export class CalculatorCls {
    public add(a: number, b: number): number {
        return a + b;
    }

    public subtract(a: number, b: number): number {
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

export class AdvancedCalculatorCls extends CalculatorCls {
    sum(arr: number[]): number {
        return arr.reduce((acc, val) => acc + val, 0);
    }
}
