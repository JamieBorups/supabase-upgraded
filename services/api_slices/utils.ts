
import { supabase } from '../../supabase.ts';
import { Member, Contact, Venue } from '../../types.ts';

// --- MAPPERS ---
export const toSnakeCase = (str: string): string => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
export const toCamelCase = (str: string): string => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

export const mapObjectKeys = (obj: any, mapper: (s: string) => string): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => mapObjectKeys(v, mapper));
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof File) && !(obj instanceof Date) && typeof obj.getMonth !== 'function') {
        return Object.keys(obj).reduce((acc: any, key) => {
            const newKey = mapper(key);
            acc[newKey] = mapObjectKeys(obj[key], mapper);
            return acc;
        }, {});
    }
    return obj;
};

export const mapObjectToSnakeCase = (obj: any): any => mapObjectKeys(obj, toSnakeCase);
export const mapObjectToCamelCase = (obj: any): any => mapObjectKeys(obj, toCamelCase);

// --- HELPERS ---
export const handleResponse = ({ data, error }: { data: any, error: any }) => {
    if (error) {
        console.error('Supabase error:', error.message, error.details);
        throw new Error(error.message);
    }
    return data;
};

export const mapContactToDb = (contact: Partial<Contact>): any => {
    const { address, associatedProjectIds, ...rest } = contact;
    const snakeRest = mapObjectToSnakeCase(rest);
    return {
        ...snakeRest,
        address_street: address?.street,
        address_city: address?.city,
        address_province: address?.province,
        address_postal_code: address?.postalCode,
    };
};

export const mapContactFromDb = (dbContact: any): Contact => {
    const { address_street, address_city, address_province, address_postal_code, ...rest } = dbContact;
    const camelRest = mapObjectToCamelCase(rest);
    return {
        ...camelRest,
        address: {
            street: address_street,
            city: address_city,
            province: address_province,
            postalCode: address_postal_code,
        },
    } as Contact;
};

export const mapVenueToDb = (venue: Partial<Venue>) => {
    const { address, ...rest } = venue;
    return mapObjectToSnakeCase({
        ...rest,
        addressStreet: address?.street,
        addressCity: address?.city,
        addressProvince: address?.province,
        addressPostalCode: address?.postalCode,
        addressCountry: address?.country
    });
};

export const mapVenueFromDb = (dbVenue: any): Venue => {
    const { address_street, address_city, address_province, address_postal_code, address_country, ...rest } = dbVenue;
    const venueBase = mapObjectToCamelCase(rest);
    venueBase.address = {
        street: address_street,
        city: address_city,
        province: address_province,
        postalCode: address_postal_code,
        country: address_country,
    };
    return venueBase as Venue;
};
