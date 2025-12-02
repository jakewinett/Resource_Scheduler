# Resource Scheduler

An intelligent university course scheduling application that automatically generates conflict-free course schedules for the College of Science & Mathematics. Built with modern web technologies and featuring a sophisticated constraint-solving algorithm.

## Overview

Resource Scheduler solves the complex problem of university course scheduling by:
- **Importing** semester data from Excel spreadsheets (rooms, courses, calendar)
- **Auto-generating** optimal schedules using a greedy + backtracking algorithm
- **Validating** schedules in real-time with conflict detection
- **Enabling** manual adjustments via intuitive drag-and-drop interface
- **Exporting** finalized schedules to Excel for distribution

### Key Features

- 🎯 **Intelligent Scheduling**: Greedy algorithm with capacity-aware room selection and time preference optimization
- 📊 **Excel Integration**: Import/export with flexible column mapping and data normalization
- ⚡ **Real-time Validation**: Instant conflict detection for manual schedule modifications
- 🎨 **Interactive UI**: Drag-and-drop schedule editing with visual feedback
- 🔍 **Multi-view Support**: View schedules by room, teacher, or day with advanced filtering
- 📱 **Responsive Design**: Modern, accessible interface built with Radix UI and Tailwind CSS

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand with localStorage persistence
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Data Processing**: XLSX for Excel file handling
- **Icons**: Lucide React
- **Build Tool**: Vite with TypeScript compilation

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## How It Works

### 1. Data Import
Import Excel files with three sheets:
- **Rooms**: Building, capacity, type, availability
- **Courses**: Subject, enrollment, teacher, duration, lab sequencing
- **Calendar**: Semester dates and holidays

### 2. Schedule Generation
The algorithm processes courses by priority:
1. Labs first (more constrained)
2. High enrollment courses
3. Courses with fewer compatible rooms

For each course section:
- Find compatible rooms by type and capacity
- Generate time slot candidates (30-min intervals)
- Check for room/teacher conflicts with buffer times
- Apply time preferences (morning for advanced Chemistry, etc.)
- Validate lab sequencing rules

### 3. Manual Refinement
- Drag schedule blocks to new time slots
- Real-time validation prevents conflicts
- Visual feedback for warnings and errors
- Optimistic updates with rollback on validation failure

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI primitives
│   ├── ScheduleGrid.tsx # Main schedule visualization
│   ├── FileUploader.tsx # Excel import interface
│   └── ConflictPanel.tsx# Validation feedback
├── stores/              # Zustand state management
│   └── scheduleStore.ts # Central application state
├── utils/               # Core business logic
│   ├── scheduler/       # Algorithm implementation
│   ├── excelParser.ts   # Import data processing
│   └── excelExporter.ts # Export functionality
├── types/               # TypeScript definitions
└── hooks/               # Custom React hooks
```

## Key Concepts

### Room Compatibility
Courses are matched to rooms based on subject and level:
```typescript
// Biology 101/201 → Biology Lecture or General Lecture
// Chemistry 301/401 → Chemistry Lab only
// Math 301+ → Math Lab with evening preference
```

### Time Constraints
- **Buffer Times**: 15min for lectures, 60min for labs
- **Sequencing**: Labs must follow lecture days for 301+ courses
- **Preferences**: Advanced Chemistry prefers mornings, 301+ labs prefer evenings

### Data Conventions
- **Time Format**: 24-hour strings ("09:00", "14:30")
- **Day Patterns**: "MO-WE", "TU-TH", "WE-FR", or single days
- **IDs**: Composite format ("Math-101", "Baker-220")

## Contributing

1. **Types First**: Update `src/types/index.ts` for new data structures
2. **Algorithm Changes**: Modify `src/utils/scheduler/` with comprehensive testing
3. **UI Updates**: Follow Radix UI + Tailwind patterns in existing components
4. **Validation**: Add rules to `manualValidator.ts` for new constraints

## Excel File Format

### Rooms Sheet
| Column | Description | Example |
|--------|-------------|---------|
| building | Building name | "Baker" |
| roomNumber | Room identifier | "220" |
| type | Room type | "Biology Lab" |
| capacity | Max occupancy | 28 |
| availableDays | Days available | "MO,TU,WE,TH,FR" |
| start/end | Operating hours | "08:00" / "19:00" |

### Courses Sheet
| Column | Description | Example |
|--------|-------------|---------|
| subject | Course subject | "Biology" |
| courseNumber | Course level | 301 |
| teacher | Instructor name | "Dr. Rivera" |
| durationHours | Class length | 1.5 |
| daysPerWeek | Meeting frequency | 2 |
| totalEnrollment | Student count | 180 |
| isLab | Lab flag | true/false |

The parser normalizes column names and handles variations in naming conventions.
