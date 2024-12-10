package me.muaathrifath.dashboard

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class PushNotificationService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        // Handle received messages here
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Handle new token
    }
}
