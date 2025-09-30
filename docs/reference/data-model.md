# Data Model - LAPSloop MVP

## Database: PostgreSQL (Prisma)

### Tables

#### surveys
- id: String @id @default(uuid())
- title: String
- audience: String (textarea content)
- hypothesis: String (textarea content)
- questions: Json (array of {text, momTestScore, issues})
- completionCode: String @unique (e.g., "LAPS-ABC123")
- createdAt: DateTime @default(now())

#### responses
- id: String @id @default(uuid())
- surveyId: String (foreign key)
- answers: Json (array of {question, answer})
- prolificPid: String? (optional)
- completedAt: DateTime @default(now())

#### analyses
- id: String @id @default(uuid())
- surveyId: String (foreign key, unique)
- signalStrength: String (enum: "strong", "weak", "none")
- painFrequency: Int (0-100)
- painIntensity: String (enum: "high", "medium", "low")
- keyQuotes: Json (array of strings)
- currentWorkarounds: Json (array of strings)
- recommendation: String
- confidence: String (enum: "high", "medium", "low")
- reasoning: String
- createdAt: DateTime @default(now())

## Common Patterns
- All IDs are UUIDs (Prisma @default(uuid()))
- JSON fields for flexible arrays/objects
- Dates are DateTime (Prisma @default(now()))
- Foreign keys use String type (UUID references)
