export interface Aspect {
    execute(ctx: AspectContext): any;
}

export type AspectContext = {
    target: any,
    functionParams: any[],
    returnValue: any,
    error: any,
}
