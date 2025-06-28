(async () => {
  // Load the model (from local nsfwjs.min.js already injected)
  const model = await nsfwjs.load(
    'https://nsfwjs-model.s3.amazonaws.com/nsfw_mobilenet_v2/model.json',
    { size: 299 }
  );

  // Function to blur image
  const blurImage = (img) => {
    img.style.filter = 'blur(25px)';
    img.style.pointerEvents = 'none';
    img.title = '🔞 NSFW content blocked';
  };

  // Function to scan a single image
  const scanImage = async (img) => {
    if (img.dataset.nsfwScanned || !img.complete || img.naturalWidth === 0) return;
    img.dataset.nsfwScanned = 'true';

    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const predictions = await model.classify(canvas);
      const nsfwScore = predictions
        .filter(p => ['Porn', 'Sexy', 'Hentai'].includes(p.className))
        .reduce((max, p) => Math.max(max, p.probability), 0);

      if (nsfwScore > 0.7) {
        console.log('🔞 NSFW detected:', predictions, img.src);
        blurImage(img);
      }
    } catch (err) {
      console.warn('NSFW scan failed:', err);
    }
  };

  // Function to scan all images
  const scanAllImages = () => {
    document.querySelectorAll('img').forEach(scanImage);
  };

  // Initial scan
  scanAllImages();

  // Keep scanning new content
  new MutationObserver(scanAllImages).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
