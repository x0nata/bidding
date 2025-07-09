import api from './api';

class EmailNotificationService {
  constructor() {
    this.emailQueue = [];
    this.isProcessing = false;
  }

  // Send instant purchase winner email
  async sendInstantPurchaseWinnerEmail(winnerData) {
    try {
      const emailData = {
        to: winnerData.email,
        subject: `🎉 Congratulations! You Won the Auction - ${winnerData.productTitle}`,
        template: 'instant_purchase_winner',
        data: {
          winnerName: winnerData.name,
          productTitle: winnerData.productTitle,
          finalPrice: winnerData.finalPrice,
          auctionId: winnerData.auctionId,
          purchaseDate: new Date().toISOString(),
          deliveryInstructions: 'Please provide your delivery address to complete the purchase.',
          supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || 'support@auctionsite.com',
          websiteUrl: process.env.REACT_APP_WEBSITE_URL || window.location.origin
        }
      };

      const response = await api.post('/notifications/email/instant-purchase-winner', emailData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending instant purchase winner email:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send email notification' 
      };
    }
  }

  // Send auction ended notification email
  async sendAuctionEndedEmail(auctionData) {
    try {
      const emailData = {
        to: auctionData.bidderEmails, // Array of bidder emails
        subject: `Auction Ended - ${auctionData.productTitle}`,
        template: 'auction_ended',
        data: {
          productTitle: auctionData.productTitle,
          endReason: auctionData.reason,
          winnerName: auctionData.winnerName,
          finalPrice: auctionData.finalPrice,
          auctionId: auctionData.auctionId,
          endDate: new Date().toISOString(),
          websiteUrl: process.env.REACT_APP_WEBSITE_URL || window.location.origin
        }
      };

      const response = await api.post('/notifications/email/auction-ended', emailData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending auction ended email:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send email notification' 
      };
    }
  }

  // Send delivery confirmation email
  async sendDeliveryConfirmationEmail(deliveryData) {
    try {
      const emailData = {
        to: deliveryData.winnerEmail,
        subject: `Delivery Information Received - ${deliveryData.productTitle}`,
        template: 'delivery_confirmation',
        data: {
          winnerName: deliveryData.winnerName,
          productTitle: deliveryData.productTitle,
          finalPrice: deliveryData.finalPrice,
          deliveryAddress: deliveryData.deliveryAddress,
          estimatedDelivery: deliveryData.estimatedDelivery || '3-5 business days',
          trackingInfo: deliveryData.trackingInfo || 'Will be provided once shipped',
          supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || 'support@auctionsite.com',
          websiteUrl: process.env.REACT_APP_WEBSITE_URL || window.location.origin
        }
      };

      const response = await api.post('/notifications/email/delivery-confirmation', emailData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending delivery confirmation email:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send email notification' 
      };
    }
  }

  // Send outbid notification email
  async sendOutbidNotificationEmail(outbidData) {
    try {
      const emailData = {
        to: outbidData.bidderEmail,
        subject: `You've Been Outbid - ${outbidData.productTitle}`,
        template: 'outbid_notification',
        data: {
          bidderName: outbidData.bidderName,
          productTitle: outbidData.productTitle,
          yourBid: outbidData.yourBid,
          currentBid: outbidData.currentBid,
          auctionId: outbidData.auctionId,
          auctionEndTime: outbidData.auctionEndTime,
          refundAmount: outbidData.refundAmount,
          websiteUrl: process.env.REACT_APP_WEBSITE_URL || window.location.origin
        }
      };

      const response = await api.post('/notifications/email/outbid-notification', emailData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending outbid notification email:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send email notification' 
      };
    }
  }

  // Queue email for batch processing
  queueEmail(emailType, emailData) {
    this.emailQueue.push({
      type: emailType,
      data: emailData,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3
    });

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processEmailQueue();
    }
  }

  // Process email queue
  async processEmailQueue() {
    if (this.emailQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.emailQueue.length > 0) {
      const emailItem = this.emailQueue.shift();
      
      try {
        let result;
        
        switch (emailItem.type) {
          case 'instant_purchase_winner':
            result = await this.sendInstantPurchaseWinnerEmail(emailItem.data);
            break;
          case 'auction_ended':
            result = await this.sendAuctionEndedEmail(emailItem.data);
            break;
          case 'delivery_confirmation':
            result = await this.sendDeliveryConfirmationEmail(emailItem.data);
            break;
          case 'outbid_notification':
            result = await this.sendOutbidNotificationEmail(emailItem.data);
            break;
          default:
            // Unknown email type, skipping
            continue;
        }

        if (!result.success && emailItem.retries < emailItem.maxRetries) {
          // Retry failed emails
          emailItem.retries++;
          this.emailQueue.push(emailItem);
        }

      } catch (error) {
        console.error('Error processing email queue item:', error);
        
        // Retry if under max retries
        if (emailItem.retries < emailItem.maxRetries) {
          emailItem.retries++;
          this.emailQueue.push(emailItem);
        }
      }

      // Small delay between emails to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  // Send immediate notification for critical events
  async sendImmediateNotification(type, data) {
    switch (type) {
      case 'instant_purchase_winner':
        return await this.sendInstantPurchaseWinnerEmail(data);
      case 'auction_ended':
        return await this.sendAuctionEndedEmail(data);
      case 'delivery_confirmation':
        return await this.sendDeliveryConfirmationEmail(data);
      case 'outbid_notification':
        return await this.sendOutbidNotificationEmail(data);
      default:
        return { success: false, error: 'Unknown notification type' };
    }
  }

  // Get email queue status
  getQueueStatus() {
    return {
      queueLength: this.emailQueue.length,
      isProcessing: this.isProcessing,
      pendingEmails: this.emailQueue.map(item => ({
        type: item.type,
        timestamp: item.timestamp,
        retries: item.retries
      }))
    };
  }

  // Clear email queue
  clearQueue() {
    this.emailQueue = [];
    this.isProcessing = false;
  }

  // Test email service
  async testEmailService() {
    try {
      const response = await api.get('/notifications/email/test');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Email service test failed' 
      };
    }
  }
}

// Export singleton instance
export default new EmailNotificationService();
