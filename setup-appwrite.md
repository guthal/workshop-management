# Appwrite Database Setup Guide

## Option 1: Using Appwrite CLI (Recommended)

### 1. Install Appwrite CLI
```bash
npm install -g appwrite-cli
# or
yarn global add appwrite-cli
```

### 2. Initialize Appwrite Project
```bash
# In your project directory
appwrite login
appwrite init project
```

### 3. Create appwrite.json Configuration
The CLI will generate an `appwrite.json` file. Replace it with our schema:

```json
{
  "projectId": "workshop-platform",
  "projectName": "Workshop Platform",
  "databases": [
    {
      "databaseId": "workshop-platform",
      "name": "Workshop Platform Database",
      "collections": [
        {
          "collectionId": "users",
          "name": "Users",
          "documentSecurity": true,
          "attributes": [
            {
              "key": "email",
              "type": "string",
              "size": 255,
              "required": true,
              "array": false
            },
            {
              "key": "name",
              "type": "string",
              "size": 255,
              "required": true,
              "array": false
            },
            {
              "key": "role",
              "type": "enum",
              "elements": ["admin", "master", "student"],
              "required": true,
              "array": false
            },
            {
              "key": "profile",
              "type": "string",
              "size": 1000,
              "required": false,
              "array": false
            }
          ],
          "indexes": [
            {
              "key": "email_index",
              "type": "unique",
              "attributes": ["email"]
            },
            {
              "key": "role_index",
              "type": "key",
              "attributes": ["role"]
            }
          ]
        },
        {
          "collectionId": "workshops",
          "name": "Workshops",
          "documentSecurity": true,
          "attributes": [
            {
              "key": "masterId",
              "type": "string",
              "size": 36,
              "required": true,
              "array": false
            },
            {
              "key": "title",
              "type": "string",
              "size": 255,
              "required": true,
              "array": false
            },
            {
              "key": "description",
              "type": "string",
              "size": 5000,
              "required": true,
              "array": false
            },
            {
              "key": "category",
              "type": "string",
              "size": 100,
              "required": true,
              "array": false
            },
            {
              "key": "location",
              "type": "string",
              "size": 255,
              "required": true,
              "array": false
            },
            {
              "key": "price",
              "type": "integer",
              "required": false,
              "array": false
            },
            {
              "key": "capacity",
              "type": "integer",
              "required": false,
              "array": false
            },
            {
              "key": "scheduleType",
              "type": "enum",
              "elements": ["fixed", "flexible"],
              "required": true,
              "array": false
            },
            {
              "key": "startDate",
              "type": "datetime",
              "required": false,
              "array": false
            },
            {
              "key": "endDate",
              "type": "datetime",
              "required": false,
              "array": false
            },
            {
              "key": "applicationForm",
              "type": "string",
              "size": 10000,
              "required": true,
              "array": false
            },
            {
              "key": "status",
              "type": "enum",
              "elements": ["draft", "published", "cancelled"],
              "required": true,
              "array": false
            }
          ],
          "indexes": [
            {
              "key": "master_index",
              "type": "key",
              "attributes": ["masterId"]
            },
            {
              "key": "status_index",
              "type": "key",
              "attributes": ["status"]
            },
            {
              "key": "category_index",
              "type": "key",
              "attributes": ["category"]
            }
          ]
        },
        {
          "collectionId": "applications",
          "name": "Applications",
          "documentSecurity": true,
          "attributes": [
            {
              "key": "workshopId",
              "type": "string",
              "size": 36,
              "required": true,
              "array": false
            },
            {
              "key": "studentId",
              "type": "string",
              "size": 36,
              "required": true,
              "array": false
            },
            {
              "key": "responses",
              "type": "string",
              "size": 10000,
              "required": true,
              "array": false
            },
            {
              "key": "status",
              "type": "enum",
              "elements": ["pending", "approved", "rejected"],
              "required": true,
              "array": false
            }
          ],
          "indexes": [
            {
              "key": "workshop_index",
              "type": "key",
              "attributes": ["workshopId"]
            },
            {
              "key": "student_index",
              "type": "key",
              "attributes": ["studentId"]
            },
            {
              "key": "status_index",
              "type": "key",
              "attributes": ["status"]
            }
          ]
        },
        {
          "collectionId": "payments",
          "name": "Payments",
          "documentSecurity": true,
          "attributes": [
            {
              "key": "applicationId",
              "type": "string",
              "size": 36,
              "required": true,
              "array": false
            },
            {
              "key": "amount",
              "type": "integer",
              "required": true,
              "array": false
            },
            {
              "key": "status",
              "type": "enum",
              "elements": ["pending", "completed", "failed"],
              "required": true,
              "array": false
            },
            {
              "key": "stripePaymentId",
              "type": "string",
              "size": 255,
              "required": false,
              "array": false
            }
          ],
          "indexes": [
            {
              "key": "application_index",
              "type": "key",
              "attributes": ["applicationId"]
            },
            {
              "key": "status_index",
              "type": "key",
              "attributes": ["status"]
            }
          ]
        }
      ]
    }
  ]
}
```

### 4. Deploy Database Schema
```bash
# Deploy all collections
appwrite push collections --all

# Or deploy individual collections
appwrite push collection users
appwrite push collection workshops
appwrite push collection applications
appwrite push collection payments
```

### 5. Set Up Permissions (Manual Step)
After deployment, you'll need to manually set permissions in the Appwrite Console:

**Users Collection:**
- Read: `role:admin`, `role:master`, `role:student`
- Create: `users`
- Update: `role:admin`, `users`
- Delete: `role:admin`

**Workshops Collection:**
- Read: `role:admin`, `role:master`, `role:student`
- Create: `role:admin`, `role:master`
- Update: `role:admin`, `role:master`
- Delete: `role:admin`, `role:master`

**Applications Collection:**
- Read: `role:admin`, `role:master`, `role:student`
- Create: `role:student`
- Update: `role:admin`, `role:master`
- Delete: `role:admin`

**Payments Collection:**
- Read: `role:admin`, `role:master`, `role:student`
- Create: `role:admin`, `role:student`
- Update: `role:admin`
- Delete: `role:admin`

## Option 2: Manual Setup via Appwrite Console

If you prefer manual setup:

1. Go to your Appwrite Console
2. Create a new database called "workshop-platform"
3. Create collections manually using the schema structure above
4. Add attributes one by one
5. Set up indexes
6. Configure permissions

## Environment Variables

After setup, update your `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_actual_project_id
APPWRITE_API_KEY=your_api_key
```

## Verification

Test your setup:

```bash
# Check collections
appwrite list collections

# Check specific collection
appwrite get collection users
```