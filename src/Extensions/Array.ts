/* eslint-disable no-extend-native */

declare global {
    interface Array<T> {
        last(): T;

        isMatched(array: Array<T>): boolean;
    }
}

Array.prototype.last = function() {
    return this[this.length - 1];
}

Array.prototype.isMatched = function(array) {
    if (this.length !== array.length) {
        return false;
    }
    
    for (let i = 0; i < this.length; i ++) {
            if (this[i] !== array[i]) {
                return false;
            }
    }

    return true;
}

export {};