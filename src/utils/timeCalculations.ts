export const calculateHunger = (lastEat: Date) => {
    const hoursPassed = (Date.now() - lastEat.getTime()) / (1000 * 60 * 60); // waktu dalam jam
    const hunger = Math.min(100, (hoursPassed / 6) * 100); // 0-100% dalam 6 jam
    return hunger;
};

export const calculateThirst = (lastDrink: Date) => {
    const hoursPassed = (Date.now() - lastDrink.getTime()) / (1000 * 60 * 60); // waktu dalam jam
    const thirst = Math.min(100, (hoursPassed / 3) * 100); // 0-100% dalam 3 jam
    return thirst;
};
