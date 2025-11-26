// WhatsApp Cloud API Integration
// Using Meta's Graph API for sending WhatsApp messages

// Configuration - Replace with your actual values from Meta Developer Dashboard
const WHATSAPP_CONFIG = {
  // Paste your generated access token here
  accessToken: 'PASTE_YOUR_LONG_TOKEN_HERE',
  
  // Phone Number ID from your Meta dashboard
  phoneNumberId: '941269635726401',
  
  // API version
  apiVersion: 'v18.0',
  
  // Test number for wa.me links (without + sign)
  testNumber: '15556225015'
};

// Base URL for WhatsApp Cloud API
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;

// Format phone number for WhatsApp API (needs country code, no + or spaces)
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, assume Uganda and replace with 256
  if (cleaned.startsWith('0')) {
    cleaned = '256' + cleaned.substring(1);
  }
  
  // If doesn't start with country code, assume Uganda
  if (!cleaned.startsWith('256') && cleaned.length <= 9) {
    cleaned = '256' + cleaned;
  }
  
  return cleaned;
};

// Send a text message via WhatsApp Cloud API
export const sendWhatsAppMessage = async (
  recipientPhone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const formattedPhone = formatPhoneForWhatsApp(recipientPhone);
  
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.messages?.[0]?.id
      };
    } else {
      console.error('WhatsApp API Error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send message'
      };
    }
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Send a template message (for verified templates only)
export const sendWhatsAppTemplate = async (
  recipientPhone: string,
  templateName: string,
  languageCode: string = 'en',
  components?: Array<{
    type: 'body' | 'header';
    parameters: Array<{ type: 'text'; text: string }>;
  }>
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const formattedPhone = formatPhoneForWhatsApp(recipientPhone);
  
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components || []
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.messages?.[0]?.id
      };
    } else {
      console.error('WhatsApp Template Error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send template'
      };
    }
  } catch (error) {
    console.error('WhatsApp template error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Job status update messages
export const whatsappMessages = {
  jobCreated: (jobId: string, vehicleInfo: string) => 
    `🔧 *MotoTrackr* - New Job Created!\n\nJob #${jobId}\nVehicle: ${vehicleInfo}\n\nWe'll keep you updated on the progress. Reply with your Job ID anytime to check status.`,
  
  jobInProgress: (jobId: string, mechanicName: string) =>
    `🛠️ *MotoTrackr* Update\n\nJob #${jobId} is now IN PROGRESS\nMechanic: ${mechanicName}\n\nYour boda is being worked on!`,
  
  jobAwaitingParts: (jobId: string, partsNeeded: string) =>
    `⏳ *MotoTrackr* Update\n\nJob #${jobId} is AWAITING PARTS\nParts needed: ${partsNeeded}\n\nWe'll notify you when parts arrive.`,
  
  jobCompleted: (jobId: string, totalCost: number) =>
    `✅ *MotoTrackr* - Job Complete!\n\nJob #${jobId} is READY FOR PICKUP\nTotal Cost: UGX ${totalCost.toLocaleString()}\n\nThank you for choosing MotoTrackr! 🏍️`,
  
  costUpdate: (jobId: string, description: string, amount: number, newTotal: number) =>
    `💰 *MotoTrackr* Cost Update\n\nJob #${jobId}\nNew item: ${description}\nAmount: UGX ${amount.toLocaleString()}\nNew Total: UGX ${newTotal.toLocaleString()}`,
  
  workLog: (jobId: string, logEntry: string) =>
    `📝 *MotoTrackr* Work Update\n\nJob #${jobId}\n${logEntry}`
};

// Send job notification via WhatsApp Cloud API
export const sendJobNotification = async (
  phone: string,
  messageType: keyof typeof whatsappMessages,
  ...args: any[]
): Promise<{ success: boolean; error?: string }> => {
  const messageGenerator = whatsappMessages[messageType] as (...args: any[]) => string;
  const message = messageGenerator(...args);
  
  return sendWhatsAppMessage(phone, message);
};

// Generate wa.me link for the test number (for user-initiated conversations)
export const getWhatsAppLink = (prefilledMessage?: string): string => {
  const baseUrl = `https://wa.me/${WHATSAPP_CONFIG.testNumber}`;
  if (prefilledMessage) {
    return `${baseUrl}?text=${encodeURIComponent(prefilledMessage)}`;
  }
  return baseUrl;
};

// Generate verification link for users to start conversation
export const getVerificationLink = (): string => {
  return getWhatsAppLink('Hi! I want to verify my number for MotoTrackr notifications.');
};

// Check if WhatsApp API is configured
export const isWhatsAppConfigured = (): boolean => {
  return WHATSAPP_CONFIG.accessToken !== 'PASTE_YOUR_LONG_TOKEN_HERE' && 
         WHATSAPP_CONFIG.accessToken.length > 50;
};

export default {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendJobNotification,
  formatPhoneForWhatsApp,
  getWhatsAppLink,
  getVerificationLink,
  isWhatsAppConfigured,
  whatsappMessages
};
