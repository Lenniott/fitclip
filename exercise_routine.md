## 🏋️ **Routine Data Structure**

### **Create Routine Request:**
```json
{
  "name": "5-Minute Desk Mobility",
  "description": "A quick standing routine for desk workers",
  "exercise_ids": [
    "047cb042-a3cf-49cc-a763-10290014ac96",
    "5bb68483-8edc-4a4b-ab4c-371b9b61a237",
    "10c7c447-c16c-4c37-b4da-28e5d8cdd132"
  ]
}
```

### **Routine Response:**
```json
{
  "routine_id": "57243567-9e4e-4df6-a18d-d4e4ccbd2d38",
  "name": "5-Minute Desk Mobility",
  "description": "A quick standing routine for desk workers",
  "exercise_ids": [
    "047cb042-a3cf-49cc-a763-10290014ac96",
    "5bb68483-8edc-4a4b-ab4c-371b9b61a237",
    "10c7c447-c16c-4c37-b4da-28e5d8cdd132"
  ],
  "created_at": "2025-07-27T13:56:39.356021"
}
```

## 💪 **Exercise Data Structure**

### **Exercise Response:**
```json
{
  "id": "c8c8d8dd-4223-44e9-88c7-f20695bc1e35",
  "exercise_name": "Push-up",
  "video_path": "storage/clips/push-up_abc123.mp4",
  "start_time": 10.5,
  "end_time": 25.3,
  "how_to": "Start in plank position, lower body, push back up",
  "benefits": "Strengthens chest, shoulders, and triceps",
  "counteracts": "Improves upper body pushing strength",
  "fitness_level": 3,
  "rounds_reps": "3 sets of 10-15 reps",
  "intensity": 5,
  "qdrant_id": "77c6856e-e4a2-42a7-b361-bc73808ac812",
  "created_at": "2025-07-26T06:08:17.423912"
}
```

## 📊 **Database Schema**

### **Routines Table (`workout_routines`):**
```sql
CREATE TABLE workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    exercise_ids TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Exercises Table (`exercises`):**
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    normalized_url VARCHAR(500) NOT NULL,
    carousel_index INTEGER DEFAULT 1,
    exercise_name VARCHAR(200) NOT NULL,
    video_path VARCHAR(500) NOT NULL,
    start_time DECIMAL(10,3),
    end_time DECIMAL(10,3),
    how_to TEXT,
    benefits TEXT,
    counteracts TEXT,
    fitness_level INTEGER CHECK (fitness_level >= 0 AND fitness_level <= 10),
    rounds_reps VARCHAR(200),
    intensity INTEGER CHECK (intensity >= 0 AND intensity <= 10),
    qdrant_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## �� **How They Connect**

1. **Routines** contain an array of `exercise_ids` (UUIDs)
2. **Exercises** have their own `id` (UUID) and `qdrant_id` (UUID for vector search)
3. **UI Workflow**:
   - Create routine with exercise IDs
   - Fetch full exercise details using bulk endpoint
   - Display routine with complete exercise data

