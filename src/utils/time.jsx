/**
 * Checks if the current time is within one of the active bidding windows.
 * Bidding windows are 8:00 AM - 9:00 AM and 8:00 PM - 9:00 PM IST.
 * @returns {boolean} True if the bidding window is active, false otherwise.
 */
export const isBiddingWindowActive = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Window 1: 8:00 AM to 8:59 AM
    const isMorningWindow = currentHour === 8;
    // Window 2: 8:00 PM to 8:59 PM (20:00 to 20:59 in 24-hour format)
    const isEveningWindow = currentHour === 20;

    return isMorningWindow || isEveningWindow;
    // return true; [DEBUG]
};

/**
 * Gets the time until the next bidding window starts.
 * @returns {string} A formatted string indicating the time remaining.
 */
export const getTimeToNextWindow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();

    let nextWindowHour;

    if (currentHour < 8) {
        nextWindowHour = 8; // Next window is 8 AM today
    } else if (currentHour < 20) {
        nextWindowHour = 20; // Next window is 8 PM today
    } else {
        nextWindowHour = 8; // Next window is 8 AM tomorrow
    }

    const nextWindowTime = new Date();
    if (currentHour >= 20) {
        // If it's past 8 PM, the next window is tomorrow
        nextWindowTime.setDate(now.getDate() + 1);
    }
    nextWindowTime.setHours(nextWindowHour, 0, 0, 0);

    const diff = nextWindowTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
};
