
/**
 * Hashes a password using the Web Crypto API (SHA-256).
 * This is a one-way hash, suitable for password verification.
 * @param password The plaintext password to hash.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
export async function generatePasswordHash(password: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        // This is a safeguard for non-secure contexts (http) or old environments.
        // Modern browsers over HTTPS will have crypto.subtle.
        console.error("Web Crypto API not available. Cannot hash password.");
        throw new Error("Crypto API not available in this context.");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert buffer to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
