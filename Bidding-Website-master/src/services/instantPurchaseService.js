import apiService from './api';
import { store } from '../redux/store';
import {
  addInstantPurchaseNotification,
  addAuctionEndedNotification,
  showSuccess,
  showError
} from '../redux/slices/notificationSlice';
import emailNotificationService from './emailNotificationService';

class InstantPurchaseService {
  constructor() {
    this.processingPurchases = new Set();
  }

  // Check if a bid amount triggers instant purchase
  checkInstantPurchase(bidAmount, auction) {
    if (!auction.instantPurchasePrice) {
      return false;
    }
    
    return parseFloat(bidAmount) >= parseFloat(auction.instantPurchasePrice);
  }

  // Process instant purchase when bid meets or exceeds instant purchase price
  async processInstantPurchase(bidData, auction, bidder) {
    const purchaseKey = `${auction.id}-${bidder.id}`;
    
    // Prevent duplicate processing
    if (this.processingPurchases.has(purchaseKey)) {
      return { success: false, message: 'Purchase already being processed' };
    }

    this.processingPurchases.add(purchaseKey);

    try {
      // 1. End the auction immediately
      const endResult = await this.endAuctionInstantly(auction.id, {
        winnerId: bidder.id,
        finalPrice: auction.instantPurchasePrice,
        reason: 'instant_purchase',
        bidId: bidData.id
      });

      if (!endResult.success) {
        throw new Error(endResult.message || 'Failed to end auction');
      }

      // 2. Notify the winner
      await this.notifyWinner(auction, bidder, auction.instantPurchasePrice);

      // 3. Notify other bidders that auction ended
      await this.notifyOtherBidders(auction, bidder, auction.instantPurchasePrice);

      // 4. Process refunds for other bidders
      await this.processRefunds(auction.id, bidder.id);

      // 5. Update auction status in real-time
      await this.broadcastAuctionEnd(auction, bidder, auction.instantPurchasePrice);

      store.dispatch(showSuccess('Instant purchase completed successfully!'));

      return {
        success: true,
        auctionEnded: true,
        instantPurchase: true,
        finalPrice: auction.instantPurchasePrice,
        winner: bidder,
        product: auction
      };

    } catch (error) {
      console.error('Error processing instant purchase:', error);
      store.dispatch(showError('Failed to process instant purchase. Please try again.'));
      
      return {
        success: false,
        message: error.message || 'Failed to process instant purchase'
      };
    } finally {
      this.processingPurchases.delete(purchaseKey);
    }
  }

  // End auction immediately due to instant purchase
  async endAuctionInstantly(auctionId, endData) {
    try {
      const response = await apiService.auctions.endInstantPurchase(auctionId, endData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error ending auction:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to end auction' 
      };
    }
  }

  // Notify the instant purchase winner
  async notifyWinner(auction, winner, finalPrice) {
    try {
      // Add to Redux store for immediate UI update
      store.dispatch(addInstantPurchaseNotification({
        productTitle: auction.title,
        finalPrice: finalPrice,
        productId: auction.id,
        winner: winner
      }));

      // Send to backend for persistence and WebSocket notifications
      await apiService.notifications.sendInstantPurchaseWinner({
        userId: winner.id,
        productId: auction.id,
        productTitle: auction.title,
        finalPrice: finalPrice,
        auctionType: auction.auctionType,
        type: 'instant_purchase_win'
      });

      // Send email notification to winner
      if (winner.email) {
        await emailNotificationService.sendImmediateNotification('instant_purchase_winner', {
          email: winner.email,
          name: winner.name,
          productTitle: auction.title,
          finalPrice: finalPrice,
          auctionId: auction.id
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error notifying winner:', error);
      return { success: false, error };
    }
  }

  // Notify other bidders that auction ended due to instant purchase
  async notifyOtherBidders(auction, winner, finalPrice) {
    try {
      // Add to Redux store for immediate UI update
      store.dispatch(addAuctionEndedNotification({
        productTitle: auction.title,
        reason: 'instant_purchase',
        winner: winner,
        finalPrice: finalPrice
      }));

      // Send to backend for broader notification
      await apiService.notifications.sendAuctionEnded({
        productId: auction.id,
        productTitle: auction.title,
        reason: 'instant_purchase',
        winnerId: winner.id,
        winnerName: winner.name,
        finalPrice: finalPrice,
        excludeUserId: winner.id // Don't notify the winner again
      });

      return { success: true };
    } catch (error) {
      console.error('Error notifying other bidders:', error);
      return { success: false, error };
    }
  }

  // Process refunds for other bidders
  async processRefunds(auctionId, winnerId) {
    try {
      await apiService.post(`/auctions/${auctionId}/process-refunds`, {
        excludeUserId: winnerId,
        reason: 'instant_purchase'
      });
      return { success: true };
    } catch (error) {
      console.error('Error processing refunds:', error);
      return { success: false, error };
    }
  }

  // Broadcast auction end via WebSocket
  async broadcastAuctionEnd(auction, winner, finalPrice) {
    try {
      // This would typically be handled by the backend WebSocket server
      // But we can trigger it via API call
      await apiService.post('/websocket/broadcast', {
        event: 'auction_ended_instant_purchase',
        data: {
          auctionId: auction.id,
          productTitle: auction.title,
          winnerId: winner.id,
          winnerName: winner.name,
          finalPrice: finalPrice,
          reason: 'instant_purchase'
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error broadcasting auction end:', error);
      return { success: false, error };
    }
  }

  // Submit delivery information for instant purchase winner
  async submitDeliveryInfo(productId, deliveryInfo, finalPrice, auction, winner) {
    try {
      const response = await apiService.bidding.submitDeliveryInfo(productId, {
        deliveryInfo,
        finalPrice,
        type: 'instant_purchase',
        timestamp: new Date().toISOString()
      });

      // Send delivery confirmation email
      if (deliveryInfo.email || winner?.email) {
        const deliveryAddress = `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.region}`;

        await emailNotificationService.sendImmediateNotification('delivery_confirmation', {
          winnerEmail: deliveryInfo.email || winner.email,
          winnerName: deliveryInfo.fullName || winner.name,
          productTitle: auction?.title || 'Auction Item',
          finalPrice: finalPrice,
          deliveryAddress: deliveryAddress,
          estimatedDelivery: '3-5 business days',
          trackingInfo: 'Will be provided once shipped'
        });
      }

      store.dispatch(showSuccess('Delivery information submitted successfully! You will receive a confirmation email shortly.'));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error submitting delivery info:', error);
      store.dispatch(showError('Failed to submit delivery information. Please try again.'));
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit delivery information'
      };
    }
  }

  // Validate instant purchase conditions
  validateInstantPurchase(auction, bidAmount, bidder) {
    const errors = [];

    if (!auction) {
      errors.push('Auction not found');
    }

    if (!auction.instantPurchasePrice) {
      errors.push('This auction does not have an instant purchase option');
    }

    if (auction.status === 'ended' || auction.status === 'sold') {
      errors.push('This auction has already ended');
    }

    if (parseFloat(bidAmount) < parseFloat(auction.instantPurchasePrice)) {
      errors.push(`Bid amount must be at least ${auction.instantPurchasePrice} for instant purchase`);
    }

    if (!bidder || !bidder.id) {
      errors.push('Bidder information is required');
    }

    if (auction.sellerId === bidder.id) {
      errors.push('You cannot bid on your own auction');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get instant purchase status for an auction
  getInstantPurchaseStatus(auction, currentBid) {
    if (!auction.instantPurchasePrice) {
      return {
        available: false,
        message: 'Instant purchase not available for this auction'
      };
    }

    const instantPrice = parseFloat(auction.instantPurchasePrice);
    const currentPrice = parseFloat(currentBid || auction.startingBid || 0);

    if (auction.status === 'ended' || auction.status === 'sold') {
      return {
        available: false,
        message: 'Auction has ended'
      };
    }

    return {
      available: true,
      instantPrice,
      currentPrice,
      difference: instantPrice - currentPrice,
      message: `Bid ${instantPrice} or more to win instantly!`
    };
  }
}

// Export singleton instance
export default new InstantPurchaseService();
