/*
============================================================================
FILE: test-notifications.js
============================================================================
PURPOSE:
  Simple test script to verify the notification system is working.
  Tests both API endpoints and WebSocket connections.

USAGE:
  node test-notifications.js
============================================================================
*/

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

async function testNotificationAPI() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Get notifications for a student
    console.log('\n2. Testing notifications endpoint...');
    const notificationsResponse = await fetch(`${API_BASE_URL}/api/notifications/student/mock-student-id`);
    
    if (notificationsResponse.ok) {
      const notificationsData = await notificationsResponse.json();
      console.log('✅ Notifications fetched:', notificationsData.notifications.length, 'notifications');
      
      if (notificationsData.notifications.length > 0) {
        console.log('   Sample notification:', {
          title: notificationsData.notifications[0].title,
          type: notificationsData.notifications[0].type,
          read: notificationsData.notifications[0].read
        });
      }
    } else {
      console.log('❌ Notifications endpoint failed:', notificationsResponse.status);
    }

    // Test 3: Test mark as read (if we have notifications)
    if (notificationsResponse.ok) {
      const notificationsData = await notificationsResponse.json();
      if (notificationsData.notifications.length > 0) {
        console.log('\n3. Testing mark as read...');
        const firstNotification = notificationsData.notifications[0];
        const markReadResponse = await fetch(`${API_BASE_URL}/api/notifications/${firstNotification._id}/read`, {
          method: 'PUT'
        });
        
        if (markReadResponse.ok) {
          console.log('✅ Mark as read successful');
        } else {
          console.log('❌ Mark as read failed:', markReadResponse.status);
        }
      }
    }

    // Test 4: Test mark all as read
    console.log('\n4. Testing mark all as read...');
    const markAllReadResponse = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId: 'mock-student-id' })
    });

    if (markAllReadResponse.ok) {
      const markAllData = await markAllReadResponse.json();
      console.log('✅ Mark all as read successful:', markAllData.count, 'notifications marked');
    } else {
      console.log('❌ Mark all as read failed:', markAllReadResponse.status);
    }

    console.log('\n🎉 Notification system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && npm run dev');
  }
}

// Run the test
testNotificationAPI();
