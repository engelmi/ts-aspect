export interface Aspect {
    parameters?: any[];

    execute(target: any, args: any[]): any;
}
