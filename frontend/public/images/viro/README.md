# Viro Character Images

## 📁 Folder Structure

Place your generated Viro character images here with these exact filenames:

```
viro/
├── viro_neutral.png          (Default/Ready state)
├── viro_encouraging.png      (Warm, supportive smile)
├── viro_thoughtful.png       (Contemplative, thinking)
├── viro_excited.png          (Enthusiastic, celebrating)
├── viro_patient.png          (Calm, reassuring)
└── viro_celebratory.png      (Happy, achievement)
```

## 🎨 Image Specifications

### Required Specs
- **Format**: PNG (with or without transparency)
- **Resolution**: 1024x1024 minimum (square) or 1920x1080 (landscape)
- **File Size**: < 500KB per image (optimized for web)
- **Background**: Can include holographic elements or be transparent
- **Quality**: High-resolution, photorealistic

### Recommended Specs
- **Resolution**: 2048x2048 (will be auto-scaled)
- **Format**: PNG-24 with transparency
- **Color Space**: sRGB
- **Compression**: Optimized for web (use TinyPNG or similar)

## 🚀 Quick Integration Steps

### Step 1: Generate Images
Use the prompts from `VIRO_CHARACTER_GENERATION_GUIDE.md`:
1. Go to leonardo.ai (free) or midjourney.com
2. Use the provided prompts
3. Generate 6 emotion variations
4. Download high-res versions

### Step 2: Optimize Images
```bash
# Using ImageMagick (optional)
magick convert viro_neutral_original.png -resize 1024x1024 -quality 85 viro_neutral.png

# Or use online tools:
# - TinyPNG: https://tinypng.com
# - Squoosh: https://squoosh.app
```

### Step 3: Place Files
Simply drag and drop the 6 images into this folder with the exact filenames above.

### Step 4: Refresh App
The app will automatically detect and use the new images!

## 🎭 Emotion Guidelines

### Neutral (Default)
- Welcoming smile
- Direct eye contact
- Professional posture
- Ready to help expression

### Encouraging
- Warm, genuine smile
- Bright eyes
- Slightly leaning forward
- Supportive body language

### Thoughtful
- Contemplative expression
- Hand near chin (optional)
- Slight head tilt
- Focused gaze

### Excited
- Big smile
- Energetic expression
- Hands gesturing positively
- Enthusiastic pose

### Patient
- Calm, soft smile
- Reassuring gaze
- Relaxed posture
- Open body language

### Celebratory
- Joyful expression
- Celebrating gesture
- Bright, happy eyes
- Achievement mood

## 🎨 Background Elements

Each image should include:
- Blurred tech studio background
- Holographic code snippets (floating)
- Binary numbers (subtle)
- Purple and blue rim lighting
- Professional atmosphere

## ⚡ Performance Tips

1. **Optimize File Size**: Keep each image under 500KB
2. **Use WebP**: Consider WebP format for better compression
3. **Lazy Loading**: Images load on-demand (already implemented)
4. **Caching**: Browser caches images automatically
5. **CDN**: For production, host on CDN (Cloudflare, AWS S3)

## 🔄 Fallback System

If images are not found, the app shows a beautiful animated placeholder:
- Gradient avatar with Brain icon
- Emotion-based color schemes
- Animated effects
- Professional appearance

## 📝 Naming Convention

**DO:**
- ✅ `viro_neutral.png`
- ✅ `viro_encouraging.png`

**DON'T:**
- ❌ `Viro_Neutral.PNG`
- ❌ `viro-neutral.jpg`
- ❌ `neutral.png`

Exact filenames are required for automatic detection!

## 🎯 Testing

After adding images:
1. Open http://localhost:3000
2. Click Viro assistant (Brain icon)
3. Ask different questions to see emotion changes
4. Verify all 6 emotions load correctly

## 💡 Pro Tips

1. **Consistency**: Use same character across all emotions
2. **Lighting**: Match purple/blue theme of the app
3. **Quality**: Don't compromise on resolution
4. **Testing**: Test on different screen sizes
5. **Backup**: Keep original high-res versions

## 🆘 Troubleshooting

**Images not showing?**
- Check filenames match exactly (case-sensitive)
- Verify file format is PNG
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors

**Images too large?**
- Compress using TinyPNG
- Resize to 1024x1024
- Convert to WebP format

**Wrong emotion showing?**
- Verify filename matches emotion
- Check file isn't corrupted
- Refresh the page

## 📚 Resources

- **Generation Guide**: See `VIRO_CHARACTER_GENERATION_GUIDE.md`
- **AI Tools**: Leonardo.ai, Midjourney, DALL-E 3
- **Optimization**: TinyPNG.com, Squoosh.app
- **Testing**: Chrome DevTools, Lighthouse

---

**Current Status**: Using beautiful animated placeholders until real images are added.

**Ready to upgrade?** Just drop your 6 images here and refresh! 🚀
