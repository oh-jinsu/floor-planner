export const arrayBufferToString = (buffer: ArrayBuffer): string => {
    return new TextDecoder().decode(buffer);
}