# UI Dark Mode

## Purpose
This spec defines the dark mode (theme switching) functionality for the e‑commerce platform. Users SHALL be able to switch between light and dark themes. The system SHALL respect the user's system preference and persist their choice across sessions.

## Requirements

### Requirement: Theme Switching

Users MUST be able to switch between light and dark themes using a theme toggle button in the header. The theme SHALL change immediately without a page reload.

#### Scenario: Switch from light to dark theme

- **GIVEN** The user is viewing the site in light mode
- **AND** The theme toggle button is visible in the header
- **WHEN** The user clicks the theme toggle button and selects "Dark"
- **THEN** The site theme changes to dark mode immediately
- **AND** The UI colors, backgrounds, and text update accordingly
- **AND** No page reload occurs

#### Scenario: Switch from dark to light theme

- **GIVEN** The user is viewing the site in dark mode
- **WHEN** The user clicks the theme toggle button and selects "Light"
- **THEN** The site theme changes to light mode immediately
- **AND** The UI colors, backgrounds, and text update accordingly

### Requirement: System Preference Detection

On first visit (or when "System" is selected), the system MUST detect the user's operating system color scheme preference and apply the corresponding theme.

#### Scenario: First visit with system preference set to dark

- **GIVEN** A user visits the site for the first time
- **AND** The user's operating system is set to dark mode
- **WHEN** The page loads
- **THEN** The site automatically displays in dark mode

#### Scenario: First visit with system preference set to light

- **GIVEN** A user visits the site for the first time
- **AND** The user's operating system is set to light mode
- **WHEN** The page loads
- **THEN** The site automatically displays in light mode

### Requirement: Theme Persistence

The user's theme preference MUST be saved and persisted across browser sessions. When the user returns to the site, the previously selected theme SHALL be applied.

#### Scenario: Theme persists after page reload

- **GIVEN** The user has selected dark mode
- **WHEN** The user refreshes the page
- **THEN** The site remains in dark mode

#### Scenario: Theme persists after closing and reopening browser

- **GIVEN** The user has selected dark mode
- **WHEN** The user closes the browser and later reopens the site
- **THEN** The site loads in dark mode

### Requirement: Theme Options

The system MUST provide three theme options: Light, Dark, and System (follow operating system preference).

#### Scenario: Theme options are displayed in dropdown

- **GIVEN** The user clicks the theme toggle button
- **WHEN** The dropdown menu opens
- **THEN** Three options are displayed: "Light", "Dark", and "System"
- **AND** The currently active theme is marked with a checkmark icon

### Requirement: Theme Toggle Accessibility

The theme toggle button MUST be accessible, including proper ARIA labels and keyboard navigation.

#### Scenario: Theme toggle is keyboard accessible

- **GIVEN** A user navigates the site using a keyboard
- **WHEN** The user tabs to the theme toggle button
- **THEN** The button receives focus
- **AND** Pressing Enter or Space opens the dropdown menu

#### Scenario: Theme toggle has proper ARIA label

- **GIVEN** A screen reader user visits the site
- **WHEN** The user encounters the theme toggle button
- **THEN** The button has an ARIA label indicating its purpose (e.g., "Toggle theme")
- **AND** The current theme is announced if possible

### Requirement: Theme Consistency Across Pages

The selected theme SHALL be applied consistently across all pages of the site without flickering or flash of unstyled content.

#### Scenario: Theme applies without flash on page navigation

- **GIVEN** The user has selected dark mode
- **WHEN** The user navigates from the homepage to a product page
- **THEN** The page loads directly in dark mode
- **AND** No flash of light mode is visible before the dark theme applies

### Requirement: Visual Feedback

The theme toggle button SHALL provide visual feedback indicating the currently active theme.

#### Scenario: Button icon reflects current theme

- **GIVEN** The user is in dark mode
- **WHEN** The user views the theme toggle button
- **THEN** The button displays a moon icon (or appropriate icon) indicating dark mode

#### Scenario: Button icon reflects system theme

- **GIVEN** The user has selected "System" as the theme
- **WHEN** The user views the theme toggle button
- **THEN** The button displays a monitor icon indicating system preference mode

### Requirement: Color Scheme CSS Variables

The system MUST use CSS custom properties (variables) defined in `styles.css` for all theme‑dependent colors. This ensures consistent theming across all components.

#### Scenario: Dark mode uses dark CSS variables

- **GIVEN** The user is in dark mode
- **WHEN** The developer inspects the CSS
- **THEN** The `:root` or `.dark` class variables are applied
- **AND** All components use the dark theme colors

#### Scenario: Light mode uses light CSS variables

- **GIVEN** The user is in light mode
- **WHEN** The developer inspects the CSS
- **THEN** The default `:root` variables (light theme) are applied
- **AND** All components use the light theme colors
