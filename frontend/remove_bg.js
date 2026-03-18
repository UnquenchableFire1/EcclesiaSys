const Jimp = require('jimp');

async function removeWhiteBackground() {
    console.log('Starting logo processing...');
    const imagePath = 'src/assets/logo.png';
    const outputPath = 'src/assets/logo-transparent.png';
    
    try {
        const image = await Jimp.read(imagePath);
        
        // Ensure image has an alpha channel
        image.rgba(true);
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            
            // If the pixel is very close to white, make it transparent
            // Threshold: RGB values > 235
            if (red > 235 && green > 235 && blue > 235) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
            }
        });
        
        await image.writeAsync(outputPath);
        console.log('Successfully created transparent logo at ' + outputPath);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

removeWhiteBackground();
