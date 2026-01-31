export { };

declare global {
    interface Window {
        electron: {
            saveResult: (data: any) => Promise<{ success?: boolean; data?: any; error?: string }>;
            getLeaderboard: () => Promise<{ leaderboard: any[]; error?: string }>;
            getUserScores: (userId: string) => Promise<{ scores: any[]; error?: string }>;
        };
    };
}
