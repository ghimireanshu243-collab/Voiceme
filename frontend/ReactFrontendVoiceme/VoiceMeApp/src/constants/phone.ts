import { Linking, Platform } from 'react-native';

const DEVANAGARI_ZERO = 0x0966; // '०'

// Phone numbers in this app are often typed or shown in Nepali digits
// (e.g. "९८४१२३४५६७"). The dialer only understands ASCII digits, so convert
// ०-९ to 0-9 before stripping spaces, dashes and other formatting.
export const normalizePhoneNumber = (phone: string): string =>
  phone
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - DEVANAGARI_ZERO))
    .replace(/[^0-9+]/g, '');

export const dialPhone = (phone?: string) => {
  if (!phone) return;
  const cleanNum = normalizePhoneNumber(phone);
  if (!cleanNum) return;
  if (Platform.OS === 'web') {
    window.location.href = `tel:${cleanNum}`;
  } else {
    Linking.openURL(`tel:${cleanNum}`).catch(() => {});
  }
};
