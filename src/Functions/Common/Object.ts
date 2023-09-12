export const clone = (obj: any): any => {
    if (typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return [...obj].map(clone);
    }

    return Object.entries(obj).reduce(
        (pre, [key, value]) => ({
            ...pre,
            [key]: clone(value),
        }),
        {}
    );
};
