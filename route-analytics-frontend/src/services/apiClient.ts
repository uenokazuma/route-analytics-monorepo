const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5013";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching ${url}: ${response.statusText}`);
    }

    return response.json();
}

export const apiClient = {
    get: <T>(path: string, options?: RequestInit) =>
        request<T>(path, { method: "GET", ...options }),

    post: <T>(path: string, body: any, options?: RequestInit) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body), ...options }),

    put: <T>(path: string, body: any, options?: RequestInit) =>
        request<T>(path, { method: "PUT", body: JSON.stringify(body), ...options }),
    
    delete: <T>(path: string, options?: RequestInit) =>
        request<T>(path, { method: "DELETE", ...options }),
};