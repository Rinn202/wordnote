export type TimeTheme = 'morning' | 'afternoon' | 'night';

export function getTimeTheme(): TimeTheme {
    const hour = new Date().getHours();

    // 아침 6~11
    if (hour >= 6 && hour < 12) {
        return 'morning';
    }

    // 점심 12~17
    if (hour >= 12 && hour < 18) {
        return 'afternoon';
    }

    // 저녁~새벽
    return 'night';
}