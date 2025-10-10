# EagleAI Notification System

## Overview

The EagleAI notification system provides real-time updates and alerts to students about job matches, resume analysis, mentorship opportunities, and other career-related activities. The system is built with a modern architecture using React, Socket.IO, and MongoDB.

## Architecture

### Frontend (React)
- **NotificationProvider**: Context provider for centralized notification state management
- **NotificationBell**: UI component for displaying notifications with dropdown
- **NotificationService**: Service layer for API communication and WebSocket handling

### Backend (Node.js/Express)
- **REST API**: RESTful endpoints for notification CRUD operations
- **WebSocket (Socket.IO)**: Real-time communication for live updates
- **MongoDB**: Persistent storage for notification data

## Features

### ✅ Implemented Features
- Real-time notifications via WebSocket
- Notification types: job-match, resume-analysis, mentorship, projects, skills, roadmap, system, reminder
- Mark as read / mark all as read functionality
- Notification persistence in MongoDB
- Error handling and fallback to mock data
- Responsive UI with OC brand styling
- Notification statistics and analytics

### 🔄 Real-time Updates
- WebSocket connection for live notifications
- Automatic reconnection on connection loss
- Real-time read status updates
- Live notification counts

## API Endpoints

### Notifications
- `GET /api/notifications/student/:studentId` - Get notifications for a student
- `GET /api/notifications/:id` - Get specific notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/:id/action` - Record action taken on notification
- `POST /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/stats/:studentId` - Get notification statistics

### WebSocket Events
- `join-student` - Join student-specific room
- `subscribe-job-matches` - Subscribe to job match notifications
- `notification` - Broadcast new notification
- `notification-read` - Broadcast read status update
- `all-notifications-read` - Broadcast all read status update

## Setup and Installation

### 1. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
```

### 2. Start the Backend Server
```bash
cd backend
npm run dev
```

### 3. Start the Frontend
```bash
npm run dev
```

### 4. Seed Sample Notifications (Optional)
```bash
cd backend
npm run seed-notifications
```

### 5. Test the System
```bash
npm run test:notifications
```

## Usage

### Using Notifications in Components

```jsx
import { useNotifications } from '../context/NotificationProvider';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
}
```

### NotificationBell Component

```jsx
import NotificationBell from './components/shared/NotificationBell';

function Header() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <NotificationBell 
      isOpen={isNotificationOpen}
      onToggle={() => setIsNotificationOpen(!isNotificationOpen)}
      onClose={() => setIsNotificationOpen(false)}
    />
  );
}
```

## Notification Types

| Type | Description | Priority | Icon |
|------|-------------|----------|------|
| `job-match` | New job matches found | High | Briefcase |
| `resume-analysis` | Resume analysis completed | Medium | FileText |
| `mentorship` | Mentorship opportunities | Medium | Users |
| `projects` | Project recommendations | Low | Code |
| `skills` | Skill development alerts | Medium | Brain |
| `roadmap` | Course recommendations | High | Brain |
| `system` | System notifications | Low | Bell |
| `reminder` | General reminders | Low | Clock |

## Configuration

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/eagleai-jobs
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend
The frontend uses hardcoded URLs for development. In production, these should be environment variables:
- `API_BASE_URL`: Backend API URL
- `WS_URL`: WebSocket server URL

## Database Schema

### Notification Model
```javascript
{
  studentId: ObjectId,        // Reference to Student
  title: String,              // Notification title
  message: String,            // Notification message
  type: String,               // Notification type
  relatedJobId: ObjectId,     // Reference to Job (optional)
  priority: String,           // low, medium, high, urgent
  read: Boolean,              // Read status
  readAt: Date,               // When it was read
  clicked: Boolean,           // Click status
  clickedAt: Date,            // When it was clicked
  actionTaken: String,        // Action taken (viewed, applied, saved, dismissed)
  expiresAt: Date,            // Expiration date
  metadata: Object,           // Additional metadata
  createdAt: Date,            // Creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

## Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Falls back to mock data when backend is unavailable
2. **WebSocket Disconnection**: Automatic reconnection with exponential backoff
3. **Network Issues**: Graceful degradation with user feedback
4. **Invalid Data**: Validation and sanitization of all inputs

## Performance Considerations

- **Pagination**: Notifications are paginated (20 per page by default)
- **Caching**: Local state management reduces API calls
- **WebSocket**: Efficient real-time updates without polling
- **Database Indexes**: Optimized queries for student and read status
- **Cleanup**: Expired notifications are automatically cleaned up

## Testing

### Manual Testing
1. Start both frontend and backend servers
2. Open the notification bell in the header
3. Verify notifications load and display correctly
4. Test mark as read functionality
5. Test real-time updates (if backend is running)

### Automated Testing
```bash
# Test notification API endpoints
npm run test:notifications

# Test backend server
cd backend && npm test
```

## Troubleshooting

### Common Issues

1. **Notifications not loading**
   - Check if backend server is running
   - Verify MongoDB connection
   - Check browser console for errors

2. **WebSocket connection failed**
   - Ensure Socket.IO is properly installed
   - Check CORS configuration
   - Verify WebSocket URL

3. **Real-time updates not working**
   - Check WebSocket connection status
   - Verify student ID is correct
   - Check backend logs for errors

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'notification:*');
```

## Future Enhancements

- [ ] Push notifications for mobile
- [ ] Email notifications
- [ ] Notification preferences/settings
- [ ] Notification templates
- [ ] A/B testing for notification content
- [ ] Analytics and metrics dashboard
- [ ] Notification scheduling
- [ ] Multi-language support

## Contributing

When contributing to the notification system:

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure backward compatibility
5. Test with both mock and real data

## License

This notification system is part of the EagleAI project and follows the same MIT license.
