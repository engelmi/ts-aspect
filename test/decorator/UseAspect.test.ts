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

    describe('using classes of an aspect', () => {
        const mockFn = jest.fn().mockImplementation(() => {});

        class SampleAspect implements Aspect {
            execute(ctx: AspectContext) {
                mockFn();
            }
        }

        class SampleClass {
            public constructor(private sampleId: number) {}

            @UseAspect(Advice.Before, SampleAspect)
            public getSampleId(): number {
                return this.sampleId;
            }
        }

        let sample: SampleClass;

        beforeEach(() => {
            jest.clearAllMocks();

            sample = new SampleClass(1);
        });

        it('should execute the aspect annotated', () => {
            sample.getSampleId();

            expect(mockFn).toHaveBeenCalledTimes(1);
        });
    });
});
