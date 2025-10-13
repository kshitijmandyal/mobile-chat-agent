// Mock Gemini API for testing/demo purposes
// This simulates AI responses based on simple pattern matching

export function mockGeminiResponse(message: string, phones: any[]): string {
  const lower = message.toLowerCase();
  
  // Budget queries
  if (lower.includes('under') || lower.includes('₹') || /\d+k/i.test(message)) {
    return `Based on your budget, I've filtered phones that offer great value. These models provide excellent features within your price range, with good cameras, decent battery life, and reliable performance.`;
  }
  
  // Camera queries
  if (lower.includes('camera') || lower.includes('photo') || lower.includes('selfie')) {
    return `For photography enthusiasts, I recommend phones with high-resolution cameras and OIS (Optical Image Stabilization) for sharper, blur-free photos. The models shown have excellent camera systems perfect for capturing memories.`;
  }
  
  // Battery queries
  if (lower.includes('battery') || lower.includes('charging') || lower.includes('power')) {
    return `For long battery life, these phones feature 5000mAh+ batteries and fast charging. You'll get all-day usage with quick top-ups when needed.`;
  }
  
  // Comparison queries
  if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus') || lower.includes('difference')) {
    return `Here's a comparison of these models. Key differences include camera quality (OIS vs EIS), battery capacity, display technology (AMOLED vs LCD), and price points. Consider your priorities: photography, battery life, or budget.`;
  }
  
  // Brand specific
  if (lower.includes('samsung')) {
    return `Samsung phones offer excellent AMOLED displays, versatile cameras, and long software support. These models provide premium features at competitive prices.`;
  }
  
  if (lower.includes('pixel') || lower.includes('google')) {
    return `Google Pixel phones are known for exceptional camera software, clean Android experience, and years of OS updates. Great choice for photography and smooth performance.`;
  }
  
  if (lower.includes('oneplus')) {
    return `OnePlus devices deliver flagship performance at mid-range prices. Fast charging, smooth displays, and premium build quality are their hallmarks.`;
  }
  
  if (lower.includes('iphone') || lower.includes('apple')) {
    return `iPhones offer the iOS ecosystem, excellent cameras, long-term support, and seamless integration with other Apple devices. Premium experience with strong resale value.`;
  }
  
  // Display queries
  if (lower.includes('display') || lower.includes('screen') || lower.includes('amoled')) {
    return `These phones feature high-quality displays with vibrant colors. AMOLED screens offer deeper blacks and better contrast, while 120Hz refresh rates provide smoother scrolling.`;
  }
  
  // Compact phone queries
  if (lower.includes('compact') || lower.includes('small') || lower.includes('one hand')) {
    return `For one-handed use, I've selected phones with displays under 6.5 inches. These offer comfortable grip without compromising on features.`;
  }
  
  // Educational queries
  if (lower.includes('what is ois') || lower.includes('explain ois')) {
    return `OIS (Optical Image Stabilization) uses hardware to physically stabilize the camera lens, reducing blur from hand movement. This results in sharper photos and smoother videos compared to EIS (Electronic Image Stabilization) which uses software.`;
  }
  
  if (lower.includes('amoled vs lcd') || lower.includes('difference between amoled')) {
    return `AMOLED displays offer deeper blacks (pixels turn off completely), more vibrant colors, and better contrast than LCD. LCD screens are typically brighter in sunlight. AMOLED is generally preferred for media consumption.`;
  }
  
  // Default response
  return `I've found ${phones.length} phone(s) matching your criteria. These options balance performance, features, and value. Consider your priorities like camera quality, battery life, display, and budget when choosing.`;
}
