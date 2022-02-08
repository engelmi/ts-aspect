export interface Aspect {
    execute(ctx: AspectContext): any;
}

export type AspectContext = {
    target: any;
    methodName: string;
    functionParams: any[];
    returnValue: any;
    error: any;
};
