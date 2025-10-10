/*
============================================================================
FILE: demo-notifications.js
============================================================================
PURPOSE:
  Demo script to showcase the enhanced notification system with job links
  and beautiful job cards. This script simulates real-time notifications
  to demonstrate the system's capabilities.

USAGE:
  node demo-notifications.js
============================================================================
*/

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

// Demo job notifications with rich data
const demoNotifications = [
  {
    studentId: 'demo-student-001',
    title: 'New Job Match: Software Engineer Intern',
    message: 'We found a 95% match for you at Google. Full-stack development internship with React and Node.js.',
    type: 'job-match',
    relatedJobId: 'job-001',
    priority: 'high',
    applicationUrl: 'https://careers.google.com/jobs/results/1234567890',
    company: 'Google',
    location: 'Mountain View, CA',
    jobType: 'internship',
    isRemote: false,
    salaryRange: { min: 6000, max: 8000 },
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    matchScore: 95
  },
  {
    studentId: 'demo-student-001',
    title: 'New Job Match: AI/ML Research Intern',
    message: 'OpenAI has a 92% match for you. Contribute to cutting-edge AI research and develop next-generation AI systems.',
    type: 'job-match',
    relatedJobId: 'job-008',
    priority: 'high',
    applicationUrl: 'https://openai.com/careers/1234567890',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    jobType: 'internship',
    isRemote: true,
    salaryRange: { min: 10000, max: 15000 },
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP'],
    matchScore: 92
  },
  {
    studentId: 'demo-student-001',
    title: 'Resume Review Complete',
    message: 'Your Software Engineer resume scored 8.7/10. Excellent technical skills, consider adding more project details.',
    type: 'resume-analysis',
    priority: 'medium'
  }
];

async function createNotification(notificationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Created notification:', result.title);
      return result;
    } else {
      console.log('❌ Failed to create notification:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating notification:', error.message);
    return null;
  }
}

async function simulateRealTimeNotifications() {
  console.log('🚀 Starting Notification System Demo...\n');

  // Check if backend is running
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend not responding');
    }
    console.log('✅ Backend server is running\n');
  } catch (error) {
    console.log('❌ Backend server is not running. Please start it with:');
    console.log('   cd backend && npm run dev\n');
    return;
  }

  // Create demo notifications
  console.log('📝 Creating demo notifications...\n');
  
  for (let i = 0; i < demoNotifications.length; i++) {
    const notification = demoNotifications[i];
    console.log(`Creating notification ${i + 1}/${demoNotifications.length}:`);
    console.log(`   Title: ${notification.title}`);
    console.log(`   Company: ${notification.company || 'N/A'}`);
    console.log(`   Match Score: ${notification.matchScore || 'N/A'}%`);
    console.log(`   Application URL: ${notification.applicationUrl || 'N/A'}`);
    
    await createNotification(notification);
    console.log('');
    
    // Simulate delay between notifications
    if (i < demoNotifications.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('🎉 Demo completed! Check your notification bell in the app to see:');
  console.log('   • Rich job notification cards with company info');
  console.log('   • Direct application links that open in new tabs');
  console.log('   • Match scores and salary information');
  console.log('   • Skills preview and location details');
  console.log('   • Beautiful, responsive design');
  console.log('\n💡 Try clicking on the job notifications to test the navigation!');
}

// Run the demo
simulateRealTimeNotifications();
