# SmartMess Database Schema & Data Dictionary

SmartMess uses SQLite3 configured with Write-Ahead Logging (WAL mode) and foreign key constraints for fast local execution and robust concurrency.

---

## 1. Schema Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ MEALS : manages
    STUDENTS ||--o{ ATTENDANCE : logs
    MEALS ||--o{ PREDICTIONS : receives
    MEALS ||--o{ WASTE_LOGS : tracks
    INVENTORY ||--o{ MEALS : consumes

    USERS {
        string id PK
        string email UK
        string password
        string name
        string role
        string hostel_assigned
        timestamp created_at
    }

    STUDENTS {
        string id PK
        string student_id UK
        string name
        string hostel
        string room
        string dietary_pref
        string status
        timestamp created_at
    }

    ATTENDANCE {
        string id PK
        string date
        string meal
        string student_id FK
        string student_name
        string hostel
        string room
        string status
        string source
        timestamp marked_at
    }

    MEALS {
        string id PK
        string date
        string meal
        string menu
        int planned_qty
        int predicted_qty
        int recommended_qty
        int prepared_qty
        int consumed_qty
        int leftover_qty
        string status
        string notes
        timestamp updated_at
    }

    PREDICTIONS {
        string id PK
        string date
        string meal
        int expected_attendance
        string menu_item
        string day_type
        int holiday_event
        int event_flag
        int predicted_demand
        int recommended_prep
        int safety_buffer
        int event_adjustment
        string confidence
        string feature_signals
        string model_type
        timestamp created_at
    }

    WASTE_LOGS {
        string id PK
        string date
        string meal
        int prepared_qty
        int consumed_qty
        int leftover_qty
        real waste_percentage
        string highest_waste_item
        string cause
        string notes
    }

    INVENTORY {
        string id PK
        string item_name
        string category
        real current_stock
        string unit
        real daily_avg_consumption
        real reorder_level
        string status
        real recommended_purchase
        timestamp last_updated
    }
```

---

## 2. Table Constraints & Indices

1. **Attendance Uniqueness**: `UNIQUE(student_id, date, meal)` — guarantees that a student cannot be marked present more than once for a single meal session.
2. **Meals Uniqueness**: `UNIQUE(date, meal)` — prevents duplicate meal scheduling.
3. **Indices for Fast Querying**:
   - `idx_attendance_date_meal` on `attendance(date, meal)`
   - `idx_attendance_student` on `attendance(student_id)`
   - `idx_meals_date` on `meals(date)`
   - `idx_predictions_date` on `predictions(date)`
