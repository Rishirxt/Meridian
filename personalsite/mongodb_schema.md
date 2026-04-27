# MongoDB Schema for Meridian (Personal OS)

This document outlines the necessary collections and their schemas for the Meridian application, mapped from the current `localStorage` implementation.

## Collections Overview

| Collection Name | Purpose | Current Source |
| :--- | :--- | :--- |
| `users` | User profile and global settings | `mood`, `pom_work`, `pom_short` |
| `tasks` | To-do items and task management | `todos` |
| `focus_sessions` | Pomodoro history and productivity tracking | `focus_sessions` |
| `goals` | Long-term and short-term goal tracking | `goals` |
| `habits` | Definition of daily habits | `habits` |
| `habit_logs` | Daily completion records for habits | `habit_done` |
| `notes` | Personal notes and documentation | `notes` |
| `quotes` | Motivational quotes (centralized storage) | `QUOTE_LIST` |

---

## 1. `users`
Stores user settings and profile information.

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "avatar": "String",
  "settings": {
    "currentMood": "String",
    "pomWork": "Number",
    "pomShort": "Number",
    "pomSessionsToday": "Number"
  },
  "updatedAt": "Date"
}
```

## 2. `tasks` (Study Tracker)
Individual tasks with priority and tags.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "text": "String",
  "done": "Boolean",
  "priority": { "type": "String", "enum": ["high", "normal", "low"] },
  "tag": "String",
  "date": "String", // YYYY-MM-DD
  "createdAt": "Date"
}
```

## 3. `focus_sessions`
Records of completed Pomodoro sessions.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "task": "String",
  "category": "String",
  "duration": "Number", // in minutes
  "date": "String",     // YYYY-MM-DD
  "time": "String",     // HH:MM
  "createdAt": "Date"
}
```

## 4. `goals`
Progress tracking for objectives.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "icon": "String",
  "name": "String",
  "desc": "String",
  "color": "String",
  "progress": "Number",  // 0-100
  "deadline": "String",
  "completed": "Boolean",
  "createdAt": "Date"
}
```

## 5. `habits`
The list of habits the user wants to track.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "icon": "String",
  "name": "String",
  "createdAt": "Date"
}
```

## 6. `habit_logs`
Tracking completion of habits per day.

```json
{
  "_id": "ObjectId",
  "habitId": "ObjectId",
  "userId": "ObjectId",
  "date": "String",      // YYYY-MM-DD
  "completed": "Boolean",
  "createdAt": "Date"
}
```

## 7. `notes`
Rich text notes with categories.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "String",
  "body": "String",
  "tag": "String",
  "color": "String",
  "date": "String",      // Display date string
  "createdAt": "Date"
}
```

## 8. `quotes`
Centralized collection for motivational quotes.

```json
{
  "_id": "ObjectId",
  "text": "String",
  "author": "String",
  "tags": ["String"]
}
```

---

## Indexing Recommendations
To ensure the app remains fast as data grows, the following indexes are recommended:
- `tasks`: `{ userId: 1, date: -1 }`
- `focus_sessions`: `{ userId: 1, date: -1 }`
- `habit_logs`: `{ habitId: 1, date: 1 }`
- `notes`: `{ userId: 1, tag: 1 }`
- `quotes`: `{ tags: 1 }`
