console.log("Printing all environment variables:");
for (const [key, value] of Object.entries(process.env)) {
  if (key.toUpperCase().includes('JAVA') || key.toUpperCase().includes('ANDROID') || key.toUpperCase().includes('FLUTTER') || key.toUpperCase().includes('PATH')) {
    console.log(`${key}: ${value}`);
  }
}
