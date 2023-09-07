export const join = (...classNames: any[]) => {
    return classNames.filter((element) => typeof element === "string").join(" ")
}