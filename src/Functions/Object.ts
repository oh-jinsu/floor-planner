export const deepCopy = (obj: any): any => {
    if (typeof obj !== 'object') return obj; 

    if (Array.isArray(obj)) {
        return [...obj].map(deepCopy);
    }

    return Object.entries(obj).reduce((pre, [key, value]) => ({
        ...pre,
        [key]: deepCopy(value),
    }), {})
}