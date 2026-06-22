export const formatAmount = (amount: number): string => {
    const format = (value: number) =>
        Number(value.toFixed(2)).toString();

    const abs = Math.abs(amount);

    if (abs >= 10000000) return `${format(amount / 10000000)}Cr`;
    if (abs >= 100000) return `${format(amount / 100000)}L`;
    if (abs >= 1000) return `${format(amount / 1000)}K`;

    return amount.toString();
};