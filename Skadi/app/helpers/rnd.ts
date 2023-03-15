const CRC_TABLE = Array(256);

for (let i = 0; i < 256; ++i) {
  let code = i;
  for (let j = 0; j < 8; ++j) {
    code = code & 0x01 ? 0xedb88320 ^ (code >>> 1) : code >>> 1;
  }
  CRC_TABLE[i] = code;
}

const crc32 = (text: string) => {
  let crc = -1;
  for (let i = 0; i < text.length; ++i) {
    const code = text.charCodeAt(i);
    crc = CRC_TABLE[(code ^ crc) & 0xff] ^ (crc >>> 8);
  }
  return (-1 ^ crc) >>> 0;
};

// Returns determined number between -0.05 and 0.05
export const rnd = (factor: number) => -0.05 + 0.01 * (crc32(factor.toString()) % 10);
