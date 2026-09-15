import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return url;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    // Fallback QR code SVG placeholder data URL
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23475569" font-family="sans-serif">QR CODE</text></svg>';
  }
}
