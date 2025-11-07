# Swedish English Teachers Classroom Adaptation Dashboard

A specialized analytical dashboard for researchers to explore how English teachers in Sweden adapt lessons for students needing support and students needing challenge, using Google Forms CSV export data.

**Experience Qualities**:
1. **Analytical** - Provides deep statistical insights through multiple lenses (correlation, Bayesian-style probabilities, factor impact analysis)
2. **Responsive** - All visualizations react instantly to filter changes, enabling exploratory data analysis
3. **Academic** - Professional, data-driven presentation suitable for education research contexts

**Complexity Level**: Light Application (multiple features with basic state)
The dashboard handles CSV upload, multi-dimensional filtering, statistical calculations, and multiple visualization types but remains single-purpose focused on this specific survey analysis.

## Essential Features

### CSV Upload & Parsing
- **Functionality**: Accepts Google Forms export in CSV or Excel format (.csv, .xlsx, .xls) with exactly 34 columns in fixed order (columns mapped by index position 0-33, not by header text)
- **Purpose**: Load the specific survey dataset about classroom adaptations in multiple formats for researcher convenience
- **Trigger**: User clicks file upload area or drags CSV/Excel file
- **Progression**: Select file → Detect format → Parse by column index → Calculate derived indices → Display dashboard
- **Success criteria**: All 12 adaptation questions (indices 3-14) parsed correctly from both CSV and Excel formats, derived indices calculated, data ready for filtering

### Derived Metrics Calculation
- **Functionality**: Computes SupportAdaptationIndex (mean of Q1-6), ChallengeAdaptationIndex (mean of Q7-12), plus categorical variables from teacher demographics
- **Purpose**: Create standardized metrics for cross-analysis
- **Trigger**: Automatically after CSV parse
- **Progression**: Parse raw values → Compute means (ignoring empty) → Categorize experience/school type → Store in enhanced dataset
- **Success criteria**: Indices scale 1-5, categories properly mapped, ready for filtering/visualization

### Interactive Filtering Sidebar
- **Functionality**: Left sidebar with filters for teaching status, school type, years experience, grade levels, group size, student need percentages
- **Purpose**: Enable slicing dataset by teacher context to find patterns
- **Trigger**: User changes any filter control
- **Progression**: Modify filter → Re-compute filtered dataset → Update all charts/stats → Update summary cards
- **Success criteria**: All visualizations update within 100ms, filter combinations work correctly

### Multi-Tab Analysis Views
- **Functionality**: Eight tabs - Overview (correlations), Playground (custom chart builder), Support Factors (impact analysis), Challenge Factors (impact analysis), Both Factors (dual analysis), Group Comparison, Per Question (item-level detail), Raw Data (table export)
- **Purpose**: Organize different analytical perspectives on the same dataset
- **Trigger**: User clicks tab
- **Progression**: Click tab → Switch view → Render appropriate charts/tables for that perspective
- **Success criteria**: Each tab shows relevant analysis, data remains filtered consistently across tabs

### Chart Playground
- **Functionality**: Interactive chart builder allowing users to select questions, group-by fields, chart types (bar, line, grouped-bar, stacked-bar, scatter, distribution), data modes (mean, median, count, percentage), comparison modes (side-by-side, overlay), and visual options (trend lines, data labels)
- **Purpose**: Enable researchers to create custom visualizations for exploratory analysis and specific research questions not covered by preset tabs
- **Trigger**: Navigate to Playground tab
- **Progression**: Select questions → Choose grouping → Pick chart type → Configure display options → View dynamically generated chart
- **Success criteria**: Charts update instantly (<200ms) as configuration changes, support all 14 question types, allow multi-question and multi-group comparisons, generate publication-ready visualizations

### Bayesian-Style Probability Analysis
- **Functionality**: For each teacher attribute (experience, school type, etc.), compute P(HighSupport | attribute) and P(HighChallenge | attribute) where High = index ≥ 4.0
- **Purpose**: Show which teacher contexts correlate with frequent use of adaptations
- **Trigger**: Navigate to Support/Challenge Factors tabs
- **Progression**: Filter data → Define high-use threshold → Calculate conditional probabilities → Display sorted bar charts
- **Success criteria**: Probabilities sum correctly, base rates shown, sorted by impact magnitude

### Per-Question Deep Dive
- **Functionality**: Select any of 12 questions to see distribution and breakdowns by teacher context variables
- **Purpose**: Identify specific adaptation strategies that vary by school type, class size, etc.
- **Trigger**: User selects question from dropdown
- **Progression**: Select question → Show histogram → Show grouped bar charts by category → Enable comparison
- **Success criteria**: All 12 questions selectable, breakdowns reveal meaningful patterns

### Raw Data Export
- **Functionality**: View filtered dataset in paginated table, download as CSV including derived columns
- **Purpose**: Enable researchers to perform external statistical analysis
- **Trigger**: User clicks download button or navigates to Raw Data tab
- **Progression**: View table → Click download → Generate CSV with derived indices → Save file
- **Success criteria**: CSV includes all original columns plus SupportAdaptationIndex and ChallengeAdaptationIndex

## Edge Case Handling
- **Insufficient columns** - Display warning banner if row has fewer than 34 columns, skip that row
- **Empty/malformed values** - Ignore when calculating means, show "N/A" in tables, don't break charts
- **No file uploaded** - Show instructional placeholder with survey name
- **Zero filtered results** - Display "No data matches current filters" message
- **Inconsistent category labels** - Best-effort fuzzy matching for years experience ranges and school types
- **Very small sample sizes** - Show warning icon next to probabilities computed from <5 responses

## Design Direction
The design should feel academic and professional—clean, data-focused, similar to research dashboards like RStudio/Jupyter output or Google Analytics. Minimal ornamentation, maximum information density balanced with breathing room. The interface recedes to let the data insights emerge. Charts use a consistent muted color palette that differentiates Support (cool tone) vs Challenge (warm tone) adaptations.

## Color Selection
Analogous cool-warm scheme to distinguish Support (blue) from Challenge (orange) while maintaining visual harmony.

- **Primary Color**: Deep Slate Blue (oklch(0.35 0.08 250)) - Professional, academic, trustworthy, used for Support-related data
- **Secondary Colors**: 
  - Warm Amber (oklch(0.65 0.15 60)) - Used for Challenge-related data, creates visual distinction without harsh contrast
  - Neutral Gray (oklch(0.50 0.02 250)) - For non-data UI elements
- **Accent Color**: Vibrant Teal (oklch(0.60 0.14 200)) - For interactive elements, focus states, highlights
- **Foreground/Background Pairings**:
  - Background (White oklch(0.98 0 0)): Dark Gray text (oklch(0.25 0.01 250)) - Ratio 12.8:1 ✓
  - Card (Light Gray oklch(0.96 0.005 250)): Dark Gray text (oklch(0.25 0.01 250)) - Ratio 11.5:1 ✓
  - Primary (Deep Slate oklch(0.35 0.08 250)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Secondary (Warm Amber oklch(0.65 0.15 60)): Dark Gray text (oklch(0.25 0.01 250)) - Ratio 5.1:1 ✓
  - Accent (Vibrant Teal oklch(0.60 0.14 200)): White text (oklch(0.98 0 0)) - Ratio 4.6:1 ✓
  - Muted (Light Gray oklch(0.92 0.005 250)): Medium Gray text (oklch(0.45 0.01 250)) - Ratio 5.8:1 ✓

## Font Selection
Use IBM Plex Sans for its academic roots (designed for IBM research) and excellent readability at various weights, paired with IBM Plex Mono for tabular data.

- **Typographic Hierarchy**:
  - H1 (Dashboard Title): IBM Plex Sans SemiBold / 28px / -0.02em letter-spacing / 1.2 line-height
  - H2 (Tab/Section Titles): IBM Plex Sans Medium / 20px / -0.01em / 1.3
  - H3 (Chart/Table Titles): IBM Plex Sans Medium / 16px / normal / 1.4
  - Body (Descriptions, Labels): IBM Plex Sans Regular / 14px / normal / 1.5
  - Data (Table Values): IBM Plex Mono Regular / 13px / normal / 1.4
  - Small (Helper Text): IBM Plex Sans Regular / 12px / normal / 1.4
  - Filter Labels: IBM Plex Sans Medium / 13px / normal / 1.4

## Animations
Subtle transitions reinforce data relationships—use motion sparingly to guide attention during filter updates and tab switches, maintaining a calm analytical atmosphere.

- **Purposeful Meaning**: Charts fade in/scale up slightly when new data loads to signal refresh; filter sidebar slides in smoothly to avoid jarring layout shifts
- **Hierarchy of Movement**: Summary cards update with gentle number animation (counting effect); charts re-render with 200ms fade; tab content cross-fades to maintain spatial stability

## Component Selection
- **Components**:
  - **Card** - For summary metrics at top (with subtle border and light background)
  - **Tabs** - For switching between Overview/Support/Challenge/PerQuestion/RawData views
  - **Select** - For categorical filters (school type, teaching status, etc.) and question selection
  - **Slider** - For group size range filter
  - **Button** - For CSV download with download icon
  - **Table** - For raw data view and factor impact tables, with alternating row backgrounds for readability
  - **ScrollArea** - For filter sidebar and long tables
  - **Separator** - Between filter groups in sidebar
  - **Badge** - To show filter counts and warnings (missing columns, small samples)
  - **Input** - File upload styled as drag-drop zone with upload icon
  
- **Customizations**:
  - Custom bar chart component using D3 for factor impact visualization
  - Custom scatter/correlation matrix using D3
  - Custom small multiples layout for 6 support + 6 challenge question averages
  - Custom probability bar chart with base rate reference line
  
- **States**:
  - Upload area: default (dashed border), dragover (highlighted border + background), uploaded (shows filename with check icon)
  - Filters: default, focused (accent ring), active (shows count badge)
  - Tables: hoverable rows (subtle background change), sortable headers (with arrows)
  - Download button: default, hover (slight scale), downloading (spinner icon)
  
- **Icon Selection**:
  - UploadSimple - File upload
  - DownloadSimple - CSV export
  - ChartBar - Support metrics / Bar charts
  - ChartLine - Challenge metrics / Line charts
  - ChartPie - Scatter plots
  - Rows - Grouped/stacked charts
  - Sparkle - Playground feature highlight
  - Funnel - Filters sidebar
  - Table - Raw data tab
  - MagnifyingGlass - Per question analysis
  - Info - Warnings and help tooltips
  - X - Clear selections
  
- **Spacing**:
  - Page padding: p-6
  - Card padding: p-6
  - Card gap: gap-6
  - Filter section gap: gap-4
  - Table cell padding: px-4 py-3
  - Section margins: mb-8
  
- **Mobile**:
  - Filters move to collapsible drawer at top (toggle button)
  - Summary cards stack vertically (grid-cols-1)
  - Charts become scrollable horizontally if needed
  - Tables show fewer columns, add horizontal scroll
  - Tabs remain horizontal with scroll for overflow
