# Dog Breed Browser -- Technical Assessment Spec

## Project Overview

Build a React single-page application that allows users to browse dog
breeds and view images for a selected breed using the Dog CEO public
API.

The project demonstrates: - React fundamentals - clean component
architecture - sensible state management - user-friendly UX - readable
and maintainable code

Estimated implementation time: 3--6 hours.

------------------------------------------------------------------------

# Objectives

The application must allow users to:

1.  Load a list of dog breeds from an API
2.  Search/filter breeds
3.  Select a breed
4.  View 3 random images of that breed
5.  Experience loading and error states

------------------------------------------------------------------------

# Success Criteria

The application is considered complete when:

-   Breeds load successfully from the API
-   Search filtering works correctly
-   Breed selection triggers image loading
-   Exactly three images display per breed
-   Loading indicators appear during API calls
-   Errors are handled gracefully
-   Codebase is structured and readable

------------------------------------------------------------------------

# Scope

## In Scope

Functional Requirements:

-   Fetch dog breeds from API
-   Transform API response into usable list
-   Display breeds in UI
-   Provide search/filter input
-   Allow breed selection
-   Fetch and display images
-   Show loading indicators
-   Handle API errors

Technical Requirements:

-   React functional components
-   Hooks-based state management
-   Modular component architecture
-   Dedicated API service layer
-   Clean styling

------------------------------------------------------------------------

# Out of Scope

Unless added as stretch goals:

-   Authentication
-   Persistent backend storage
-   Complex routing
-   SSR frameworks
-   Full test coverage
-   Enterprise accessibility audits

------------------------------------------------------------------------

# User Stories

## Browse Breeds

As a user, I want to see a list of dog breeds so I can choose one to
explore.

## Search Breeds

As a user, I want to filter breeds so I can quickly find one.

## Select Breed

As a user, I want to select a breed to see images for it.

## View Images

As a user, I want to see three images of the breed.

## Loading Feedback

As a user, I want feedback during loading so I know the app is working.

## Error Handling

As a user, I want helpful error messages when something goes wrong.

------------------------------------------------------------------------

# Functional Requirements

## Breed List Retrieval

The application must load dog breeds on startup.

Acceptance Criteria: - API request on initial render - Breed list
displayed after load - Response transformed to flat list

------------------------------------------------------------------------

## Breed Search

The user must be able to filter breeds.

Acceptance Criteria: - Search input present - Filtering is case
insensitive - Partial matches supported - Empty search restores full
list

------------------------------------------------------------------------

## Breed Selection

Acceptance Criteria: - Breed selectable from list - Selected breed
visually highlighted - Selection triggers image request

------------------------------------------------------------------------

## Breed Image Retrieval

Acceptance Criteria: - Fetch 3 images for selected breed - Display
images in gallery - Switching breeds reloads images

------------------------------------------------------------------------

## Loading States

Acceptance Criteria: - Loading indicator for breed fetch - Loading
indicator for image fetch

------------------------------------------------------------------------

## Error States

Acceptance Criteria: - Friendly error message shown - UI remains stable

------------------------------------------------------------------------

# Non Functional Requirements

## Code Quality

-   Clear component separation
-   Consistent naming
-   API logic separated from UI

## UX

-   Clean layout
-   Obvious selection state
-   Responsive search filtering

------------------------------------------------------------------------

# Recommended Tech Stack

-   React
-   TypeScript
-   Vite
-   Fetch API
-   CSS Modules or simple CSS

------------------------------------------------------------------------

# Suggested Project Structure

    src/
      components/
        BreedSearch/
        BreedList/
        BreedListItem/
        DogImageGallery/
        LoadingState/
        ErrorState/
      hooks/
        useBreeds.ts
        useBreedImages.ts
      services/
        dogApi.ts
      types/
        dog.ts
      utils/
        breedTransform.ts
      App.tsx
      main.tsx

------------------------------------------------------------------------

# Data Model

## Breed

``` ts
type Breed = string
```

Example:

\["beagle", "boxer", "husky"\]

## Image URL

``` ts
type BreedImageUrl = string
```

------------------------------------------------------------------------

# API Layer

Functions:

``` ts
getBreeds(): Promise<string[]>
getBreedImages(breed: string): Promise<string[]>
```

Responsibilities:

-   isolate API logic
-   normalize responses
-   throw meaningful errors

------------------------------------------------------------------------

# UI Layout Recommendation

Two-column layout.

Left Panel: - title - search input - breed list

Right Panel: - selected breed title - image gallery

------------------------------------------------------------------------

# Edge Cases

Handle:

-   empty API responses
-   no breed selected
-   slow API responses
-   search returning no results
-   rapid breed switching

------------------------------------------------------------------------

# Definition of Done

The project is complete when:

-   app runs locally
-   breeds load
-   filtering works
-   images load correctly
-   loading states display
-   error states display
-   code structure is clear
-   README explains setup

------------------------------------------------------------------------

# Future Improvements (Optional)

-   caching breed images
-   retry button for errors
-   skeleton loaders
-   remember last selected breed
-   unit tests
