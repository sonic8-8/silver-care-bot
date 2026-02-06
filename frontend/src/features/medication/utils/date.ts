type DateLike = {
    getFullYear: () => number;
    getMonth: () => number;
    getDate: () => number;
};

export const toLocalDateInputValue = (date: DateLike = new Date()) => {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
