// 4-space tabs
export const TOKEN_KEY = "splitwise_token";

export const saveToken = (token) => {
    if (!token) return;
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
        console.error("Unable to save token", e);
    }
};

export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const removeToken = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {}
};
