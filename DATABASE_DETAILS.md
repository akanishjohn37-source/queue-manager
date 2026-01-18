# Supabase Database Documentation - Queue Manager

This document provides a detailed breakdown of the database tables used in the Queue Manager project.

## 1. Application-Specific Tables (Core logic)

These tables define the core functionality of the hospital/service queue management system.

### `api_provider`
Stores information about the hospitals or service centers.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto-increment | Unique identifier for the provider. |
| `name` | Char(150) | Not Null | Name of the hospital or institution. |
| `location` | Char(255) | Nullable | Physical address or city. |
| `working_hours` | Char(100) | Default: "09:00 AM - 02:00 PM" | Operational hours text. |
| `admin_id` | Int | Foreign Key (`auth_user.id`) | The user who manages this provider. |

### `api_service`
Defines specific services offered by a provider (e.g., Cardiology, Radiology).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto-increment | Unique identifier for the service. |
| `name` | Char(100) | Not Null | Name of the service (e.g., "General OPD"). |
| `description` | Text | Nullable | Additional details about the service. |
| `status` | Char(10) | Default: "Active" | Current availability (Active/Inactive). |
| `provider_id` | BigInt | Foreign Key (`api_provider.id`) | The provider this service belongs to. |

### `api_servicestaff`
Maps staff members to specific services.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto-increment | Unique identifier for the staff mapping. |
| `user_id` | Int | Foreign Key (`auth_user.id`), Unique | The staff member's user account. |
| `service_id` | BigInt | Foreign Key (`api_service.id`) | The service they are assigned to. |
| `created_at` | DateTime | Auto Now Add | Record creation timestamp. |

### `api_token`
Represents the queue tokens issued to visitors.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto-increment | Unique identifier for the token. |
| `token_number` | Int | Not Null | The queue number issued. |
| `status` | Char(20) | Default: "waiting" | Current status (waiting, serving, called, canceled, finished). |
| `issued_at` | DateTime | Auto Now Add | When the token was created. |
| `visitor_name` | Char(150) | Nullable | Name provided at booking (useful if no account). |
| `service_id` | BigInt | Foreign Key (`api_service.id`) | The service requested. |
| `user_id` | Int | Foreign Key (`auth_user.id`), Nullable | The logged-in user who booked (if applicable). |
| `appointment_time` | Time | Nullable | Scheduled time for the token. |

### `api_auditlog`
Logs system actions for security and debugging.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto-increment | Unique identifier for the log entry. |
| `action` | Char(150) | Not Null | Description of what happened (e.g., "Token Created"). |
| `timestamp` | DateTime | Auto Now Add | When the action occurred. |
| `user_id` | Int | Foreign Key (`auth_user.id`), Nullable | The user who performed the action. |
| `details` | Text | Nullable | Extra metadata about the action. |

---

## 2. Authentication & System Tables

These are standard tables managed by Django and the Rest Framework.

- **`auth_user`**: Store user credentials, names, and emails.
- **`authtoken_token`**: Stores API tokens for user authentication (Token-based auth).
- **`auth_group`**: Mapping of roles/groups for users.
- **`django_session`**: Tracks active web sessions.
- **`django_migrations`**: History of database schema changes.

---

## 3. How to Retrieve/Update Schema

### Using Python (Django)
Run this command in your project root to see the current schema in Django model format:
```bash
python manage.py inspectdb
```

### Using Supabase SQL
Run this in the Supabase SQL Editor to get a list of all columns in your tables:
```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```
