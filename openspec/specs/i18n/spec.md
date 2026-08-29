# i18n

## ADDED Requirements

### Requirement: 'en' language

the system MUST provide `en` language. `en` language is default language for admin panel section.

### Requirement: 'fa' language

the system MUST provide `fa` language. ‍‍`fa` language is default language for website. SHALL do not use `fa` language in admin panel section.

#### Scenario: change language

- GIVEN user want to change language from `fa` to `en`
- WHEN change language in UI
- THEN set selected language in user cookie
- AND reload page to load new language

#### Scenario: first time user open website 

- WHEN new user for first time open website
- THEN set default language in cookie
- AND show website with default language
