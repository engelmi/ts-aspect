export interface Aspect {
    execute(ctx: AspectContext): any;
}

export type AspectContext = {
    target: any;
    method: any;
    functionParams: any[];
    returnValue: any;
    error: any;
};
