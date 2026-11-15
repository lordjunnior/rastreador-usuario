export function createServerFn(){let handler:any;const chain:any={inputValidator(){return chain},validator(){return chain},middleware(){return chain},handler(fn:any){handler=fn;return async (args:any={})=>handler({data:args.data??args,...args})}};return chain}

export function getRequestHeader(){return undefined}

export function useServerFn<T extends (...args:any[])=>any>(fn:T){return fn}

