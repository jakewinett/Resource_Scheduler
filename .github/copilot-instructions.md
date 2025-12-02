# Resource Scheduler AI Instructions

## Project Overview
University course scheduling application built with React + TypeScript + Vite. Generates conflict-free schedules using a greedy + backtracking algorithm, handles Excel import/export, and provides interactive drag-and-drop schedule editing with real-time validation.

## Core Architecture

### State Management (Zustand)
- **Primary Store**: `src/stores/scheduleStore.ts` - Central state with persistence
- **Key Actions**: `generate()`, `moveSection()`, `setFromWorkbook()`
- State includes: rooms, courses, sections, conflicts, warnings, filters, view modes
- Persistence: Only static data (rooms/courses/filters) saved to localStorage

### Scheduling Engine (`src/utils/scheduler/`)
- **solver.ts**: Main algorithm - greedy placement with capacity-aware room selection
- **constraints.ts**: Room compatibility rules and section splitting logic
- **rules.ts**: Time preferences and lab sequencing rules  
- **timeUtils.ts**: Time calculations and day pattern mappings
- **manualValidator.ts**: Real-time validation for manual schedule edits

### Data Flow
1. Excel import → `parseWorkbook()` → store update → auto-schedule trigger
2. Schedule generation: courses → room compatibility → time slot candidates → conflict checking
3. Manual edits: drag detection → validation → optimistic updates + rollback on conflict

## Key Patterns

### Component Structure
- **UI Components**: `/components/ui/` - Radix-based design system with Tailwind
- **Feature Components**: Direct in `/components/` - FileUploader, ScheduleGrid, ConflictPanel
- **Grid Layout**: Uses CSS positioning with percentage-based time slots (7AM-10PM)

### Type System (`src/types/index.ts`)
- **CourseDefinition**: Input courses with enrollment/teacher/duration
- **ScheduledSection**: Generated sections with time/room assignments  
- **Room**: Typed rooms with capacity/availability constraints
- **DayPattern**: Union type for scheduling patterns ('MO-WE', 'TU-TH', etc.)

### Excel Integration
- **Import**: `excelParser.ts` - Normalizes sheet data (flexible column names)
- **Export**: `excelExporter.ts` - Generates Master/Room/Teacher schedule sheets
- **Pattern**: Always validate/normalize external data through type-safe parsers

## Development Workflows

### Building & Running
```bash
npm run dev          # Vite dev server
npm run build        # TypeScript check + production build
npm run lint         # ESLint validation
```

### Key File Interactions
- **Adding Features**: Update types first, then solver logic, finally UI components
- **Schedule Logic**: Changes in `/constraints.ts` require testing in `/solver.ts`
- **UI Updates**: Components consume store directly - no prop drilling needed

### Common Tasks
- **New Room Types**: Update `RoomType` union + `roomCompatibility` mapping
- **Algorithm Changes**: Modify `generateSchedule()` - test with sample data first  
- **Validation Rules**: Add to `validateManualPlacement()` for real-time feedback

## Critical Dependencies
- **XLSX**: Excel file processing - handles workbook parsing/generation
- **Zustand**: State management with persistence middleware
- **Radix UI**: Accessible component primitives (Dialog, Tabs, etc.)
- **Tailwind**: Utility-first styling with custom design tokens
- **Lucide**: Icon system - consistent 4x4 sizing throughout

## Debugging Approach
- **Schedule Conflicts**: Check `conflicts` array in store state
- **Drag Issues**: Debug `ScheduleGrid` pointer events + position calculations  
- **Import Problems**: Validate Excel structure matches expected sheet names/columns
- **Performance**: Large datasets may need solver optimization or chunked processing

## Project-Specific Conventions
- **Time Format**: 24-hour strings ("09:00", "13:30") - never Date objects for times
- **IDs**: Composite format ("Math-101", "Baker-220") for human readability
- **Validation**: Prefer optimistic updates with rollback over pessimistic blocking
- **Error Handling**: User-friendly messages in UI, detailed logs in console