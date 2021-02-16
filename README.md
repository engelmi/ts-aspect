# ts-aspect

A simplistic library for **A**spect **O**riented **P**rogramming (AOP) in TypeScript. Aspects can be injected on pointcuts via regular expressions for a class or object. 

One application of AOP is the encapsulation of cross-cutting concerns, like logging, and keep the original business logic clean. Although a powerful tool, it should be used with care as it hides logic and complexity. 

![Build Status](https://travis-ci.com/engelmi/ts-aspect.svg?branch=main)


## Installation
To get started, install `ts-aspect` with npm.
```
npm install ts-aspect
```


## Usage
An aspect can be injected to the `target` class instance or object via
```javascript
function addAspect(target: any, methodName: string, advice: Advice, aspect: Aspect): void
```
or
```javascript
function addAspectToPointcut(target: any, pointcut: string, advice: Advice, aspect: Aspect): void
```
The `aspect` parameter is the actual behavior that extends the `target` code. When the `aspect` is about to be executed is defined by the `advice` parameter. Currently, the following advices are available:
- Before
- After
- Around
- AfterReturn
- TryCatch
- TryFinally

For example, the AfterReturn enables you to access the return value of the original function and execute additional logic on it (like logging). 
Finally, the `pointcut` parameter describes the where - so basically, for which functions the `aspect` should be executed. For this a regular expression can be used. 

Also, `ts-aspect` provides a method decorator to attach an aspect to a all instances of a class in a more declarative way:
```javascript
function UseAspect(advice: Advice, aspect: Aspect | (new () => Aspect)): MethodDecorator
```

## Example
Assume the following aspect class which simply logs the arguments passed to it to the console: 
```javascript
class LogAspect implements Aspect{
    function execute(...args: any): void {
        console.log(args);
    }
}
```

Also, we create the following `Calculator` class: 
```javascript
class Calculator {
    public add(a: number, b: number) {
        return a + b;
    }

    public substract(a: number, b: number) {
        return a - b;
    }

    public divide(a: number, b: number) {
        if(b === 0){
            throw new Error('Division by zero!');
        }
        return a / b;
    }

    public multiply(a: number, b: number) {
        return a * b;
    }
}
```


Now the `logArgsAspect` can be injected to an instance of `Calculator`. In the following example, the aspect is supposed to be executed before running the actual business logic: 
```javascript
const calculator = new Calculator();
addAspectToPointcut(calculator, '.*', Advice.Before, new LogAspect());
```
By defining the `pointcut` as `'.*'`, the `aspect` is run on the execution of any of the functions of the respective `Calculator` instance. Therefore, the following calls should all produce the output `[1, 2]`:
```javascript
calculator.add(1, 2);
calculator.substract(1, 2);
calculator.divide(1, 2);
calculator.multiply(1, 2);
```

An aspect can also be applied in case an exception occurs in the target code: 
```javascript
const calculator = new Calculator();
addAspect(calculator, 'divide', Advice.TryCatch, new LogAspect());
calculator.divide(1, 0);
```
In this case, the `divide` function throws the division by zero exception. Due to `Advice.TryCatch` the error is being caught and control is handed over to the aspect, which logs the error as well as both input parameters of the divide function call.  
**Note:** 
Because the aspect does not rethrow the exception implicitly, the handling will stop here. Rethrowing the error in the aspect is necessary if it is supposed to be handled elsewhere. 

### UseAspect
In addition, aspects can be added to a all class instances in a declarative manner by using the decorator `UseAspect`. Based on the Calculator example above, lets add another LogAspect to the `add` method so that the result gets logged to the console as well: 
```javascript
class Calculator {
    @UseAspect(Advice.AfterReturn, LogAspect)
    public add(a: number, b: number) {
        return a + b;
    }
    // ...
}

const calculator = new Calculator();
calculator.add(1300, 37);
```
The aspect passed to the decorator can be either a class which provides a constructor with no arguments or an instance of an aspect. 