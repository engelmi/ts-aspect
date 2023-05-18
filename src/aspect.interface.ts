export interface Aspect<Data = any, Args = any> {
    execute(ctx: AspectContext<Data, Args>): any;
}

export type AspectContext<Data, Args> = {
    target: any;
    methodName: string;
    functionParams: Args;
    returnValue: Data | null;
    error: any;
};
