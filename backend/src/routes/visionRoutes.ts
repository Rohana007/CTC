import express from 'express';
import { VisionService } from '../services/visionService';

const router = express.Router();
const visionService = new VisionService();

router.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Must be base64 encoded image.' });
    }

    const result = await visionService.analyzeImage(image);

    res.json(result);
  } catch (error) {
    console.error('Vision analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
