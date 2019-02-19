class MathHelper {
    lerp(start: number, end: number, t: number) {
        var result = (start > end)
            ? start - ((end - start) * t)
            : start + ((end - start) * t);

        return result;
    }
}

export default new MathHelper();