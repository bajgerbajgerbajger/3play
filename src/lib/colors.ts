
export async function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('#000000');
        return;
      }

      canvas.width = 1;
      canvas.height = 1;

      // Draw the image resized to 1x1 to get average color
      ctx.drawImage(img, 0, 0, 1, 1);
      
      try {
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        // Fallback if canvas gets tainted or other error
        resolve('rgba(0,0,0,0.5)');
      }
    };

    img.onerror = () => {
      resolve('rgba(0,0,0,0.5)');
    };
  });
}
