import { mock } from 'jest-mock-extended';

import { Advice } from '../../src/advice.enum';
import { Aspect, AspectContext } from '../../src/aspect.interface';
import { UseAspect } from '../../src/decorator/UseAspect';

const beforeAspect = mock<Aspect>();
const afterAspect = mock<Aspect>();

class SampleClass {
    public constructor(private sampleId: number) {}

    @UseAspect(Advice.Before, beforeAspect)
    public getSampleId(): number {
        return this.sampleId;
    }

    @UseAspect(Advice.After, afterAspect)
    @UseAspect(Advice.After, afterAspect)
    @UseAspect(Advice.AfterReturn, afterAspect)
    public setSampleId(sampleId: number): void {
        this.sampleId = sampleId;
    }

    @UseAspect(Advice.Before, beforeAspect)
    @UseAspect(Advice.After, afterAspect)
    public throwError(): void {
        throw new Error('this is expected!');
    }
}

describe('UseAspect', () => {
    let sample: SampleClass;

    beforeEach(() => {
        jest.clearAllMocks();

        sample = new SampleClass(1);
    });

    it('should execute the aspect annotated', () => {
        sample.getSampleId();

        expect(beforeAspect.execute).toHaveBeenCalledTimes(1);

        const expectedCtx: AspectContext = {
            target: sample,
            methodName: 'getSampleId',
            functionParams: [],
            returnValue: 1,
            error: null,
        };
        expect(beforeAspect.execute).toHaveBeenCalledWith(expectedCtx);
    });


    it('should instantiate a new object of the aspect class passed as parameter', () => {
        let executeHasBeenCalled = false;
        class SomeAspect implements Aspect {
            execute(ctx: AspectContext) {
                executeHasBeenCalled = true;
            }
        }
        class AnotherSampleClass {
            @UseAspect(Advice.Before, SomeAspect)
            public doIt(): void {}
        }

        const a = new AnotherSampleClass();
        a.doIt();

        expect(executeHasBeenCalled).toBe(true);
    });

    it('should execute all aspects annotated', () => {
        sample.setSampleId(1337);

        expect(afterAspect.execute).toHaveBeenCalledTimes(3);
    });

    it('should not execute the aspect annotated with Advice.After if an error is thrown in method', () => {
        expect(() => sample.throwError()).toThrow(Error);
        expect(beforeAspect.execute).toHaveBeenCalledTimes(1);
        expect(afterAspect.execute).toHaveBeenCalledTimes(0);
    });

    describe('for async functions', () => {
        const aspect = mock<Aspect>();
        aspect.execute.mockImplementation((ctx: AspectContext) => {
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
            [Advice.TryFinally, 1, 1337, 1337],
        ])(
            'should execute the aspect at the advice %s annotated %d times',
            async (
                advice: Advice,
                numberOfCalls: number,
                initialSampleId: number,
                expectedReturnSampleId: number,
            ) => {
                class SampleClassAsync {
                    public constructor(public sampleId: number) {}

                    @UseAspect(advice, aspect)
                    public async getSampleIdAsync(): Promise<number> {
                        return this.sampleId;
                    }
                }

                const cls = new SampleClassAsync(initialSampleId);
                const sampleId = await cls.getSampleIdAsync();

                expect(aspect.execute).toHaveBeenCalledTimes(numberOfCalls);
                expect(sampleId).toBe(expectedReturnSampleId);
            },
        );

        it('should execute the aspect at the advice TryCatch', async () => {
            class SampleClassAsync {
                @UseAspect(Advice.TryCatch, aspect)
                public async getSampleIdAsync(): Promise<number> {
                    throw Error('throwing error for TryCatch Advice');
                }
            }

            const cls = new SampleClassAsync();
            const sampleId = await cls.getSampleIdAsync();

            expect(aspect.execute).toHaveBeenCalledTimes(1);
            expect(sampleId).toBe(null);
        });
    });
});
