# Haven Brand Identity & Design System

## Brand Identity (Contribution led by the Brand Strategist)

### Brand Essence

Based on the core project goals and the needs of the Problem Aware avatar, Haven's brand is defined by the following attributes:

*   **Anonymity:** The foundational promise of the brand; the user is untraceable.
*   **Security:** The technical and philosophical commitment to protecting user communication at all costs.
*   **Privacy:** The unwavering belief that private conversations are a fundamental right.
*   **Integrity:** A brand that operates on principles, not profit from data.
*   **Freedom:** The ultimate benefit delivered to the user—the freedom to communicate without fear.
*   **Trust:** The emotional cornerstone of the relationship with the user, earned through transparency and reliability.
*   **Empowerment:** Providing users with the tools they need to reclaim their digital autonomy.

### Brand Voice

*   **Tone:** The tone is **Reassuring, Professional, Confident, and Serious.** It acknowledges the gravity of the user's concerns and speaks to them with respect and intelligence. It is never casual, flippant, or overly enthusiastic.
*   **Language:** The language is **Clear, direct, and precise.** While it avoids marketing jargon, it is not afraid to use technical terms like "end-to-end encryption," "metadata," or "threat modeling," as the target audience is knowledgeable and values technical competence. All claims are backed by evidence and transparent explanations.
*   **Communication Style:** The style is **Solution-oriented and principled.** It focuses on the tangible benefits of true privacy and security. Communication is direct, honest, and stripped of hyperbole, reflecting a brand that is confident in its product and respects its users' intelligence.

### Brand Narrative

In a world where our digital lives are monitored and monetized, the freedom to speak without fear has become a luxury. For journalists, activists, and everyday citizens who dare to question power, the search for a truly private space to communicate is a constant struggle against compromised platforms and corporate surveillance. Haven was born from this struggle. We provide a sanctuary for communication—an encrypted, anonymous messaging application built on a single, unwavering principle: your conversations are yours alone. We empower individuals to reclaim their digital privacy, protect their networks, and speak freely, offering not just a tool, but a fundamental right. With Haven, you are not the product; you are protected.

## Design System (Contribution led by the Lead UI/UX Designer and Lead Front-End Developer)

### Color Palette

#### Primary Colors

*   **Gradient Base:** The brand's core identity is represented by a gradient that symbolizes the journey from the darkness of surveillance to the clarity of truth. The official CSS gradient is:
    `linear-gradient(120deg, #0D1B2A, #1B263B, #415A77, #778DA9, #E0E1DD)`

*   **Primary Colors (Extracted from gradient):**

| Color | Hex | Attribute |
| :--- | :--- | :--- |
| Midnight Blue | `#0D1B2A` | Security |
| Deep Slate | `#1B263B` | Trust |
| Shadow Blue | `#415A77` | Integrity |
| Steel Blue | `#778DA9` | Clarity |
| Fog | `#A3B1C6` | Calm |
| Ghost White | `#E0E1DD` | Truth |

#### Secondary Colors

| Name | Hex | Usage |
| :--- | :--- | :--- |
| Primary Text | `#0D1B2A` | For all primary body copy and headlines. |
| Secondary Text | `#778DA9` | For sub-headings, labels, and descriptive text. |
| Background | `#F4F4F8` | For light mode backgrounds. |
| White | `#FFFFFF` | For cards, modals, and high-contrast elements. |
| Black | `#000000` | For dark mode backgrounds and high-contrast elements. |

#### Functional Colors

| Name | Hex | Usage |
| :--- | :--- | :--- |
| Success | `#2ECC71` | For successful actions, confirmations, and online status. |
| Warning | `#F1C40F` | For non-critical alerts and warnings. |
| Error | `#E74C3C` | For failed actions, critical errors, and destructive actions. |
| Info | `#3498DB` | For informational messages and highlights. |

### Typography

#### Font Family

*   **Primary Font: Inter**
    *   **Justification:** Inter is a clean, modern, and highly readable sans-serif font designed specifically for computer screens. Its neutral yet professional character is perfect for a tool that must convey trust, clarity, and seriousness. Its excellent legibility at all sizes ensures that the user interface is accessible and easy to navigate.
*   **Secondary Font: DM Serif Display**
    *   **Justification:** Used sparingly for major headlines (H1, H2), DM Serif Display provides a touch of gravitas and sophistication. Its high-contrast letterforms are elegant and commanding, reflecting the importance of the brand's mission and the serious nature of its work.

#### Font Sizes

| Element | rem | px | Line Height |
| :--- | :--- | :--- | :--- |
| **Display** | 4.5rem | 72px | 1.1 |
| **H1** | 3rem | 48px | 1.2 |
| **H2** | 2.25rem | 36px | 1.25 |
| **H3** | 1.875rem | 30px | 1.3 |
| **H4** | 1.5rem | 24px | 1.4 |
| **H5** | 1.25rem | 20px | 1.5 |
| **H6** | 1rem | 16px | 1.5 |
| **Body (Regular)** | 1rem | 16px | 1.6 |
| **Body (Small)** | 0.875rem | 14px | 1.5 |
| **Body (XSmall)** | 0.75rem | 12px | 1.5 |
| **Caption** | 0.75rem | 12px | 1.4 |

#### Font Weights

*   **Light:** 300
*   **Regular:** 400
*   **Medium:** 500
*   **Semibold:** 600
*   **Bold:** 700

### UI Components

#### 21st.dev Components

Given the need for a professional and secure interface, the following categories of components from a library like 21st.dev will be utilized:

*   **Layout:** Grid, Stack, and Flex components for structuring the application.
*   **Forms:** Secure Input, Textarea, Checkbox, and Toggle components for all user interactions.
*   **Feedback:** Spinner, Progress, and Alert components to provide clear system status.
*   **Overlay:** Modal, Drawer, and Tooltip components for contextual information and actions.
*   **Navigation:** Secure navigation menus and breadcrumbs.

#### MagicUI Components

To enhance the user experience with subtle, meaningful animations, the following components from a library like MagicUI will be incorporated:

*   **Animated Shiny Text:** For the main headline on the landing page to draw attention to the brand's core promise.
*   **Blur In:** A subtle entrance animation for modals and new content to create a smooth, focused transition.
*   **Number Ticker:** To animate statistics on the marketing page, such as the number of threats blocked or users protected.
*   **Shimmer Button:** A subtle hover effect for primary call-to-action buttons.
*   **Fade Text:** To cycle through key brand attributes (Secure, Private, Anonymous) in the hero section.

#### reactbits.dev Components

The following component patterns from a resource like reactbits.dev will be implemented:

*   **Disclosure:** Accordion and Tabs for organizing settings and information panels.
*   **Data Display:** Secure tables and lists for displaying contact information or session history.
*   **Input:** Advanced input patterns for secure file uploads and search.
*   **Layout:** Patterns for creating responsive and adaptive screen layouts.

#### Custom Components

*   **Secure Identity Generator:** A custom interface for generating a new anonymous user identity, visualizing the strength of the generated credentials without storing them.
*   **Threat Model Visualizer:** An interactive dashboard widget that allows users to see a simplified representation of their current security level and potential threats they are protected from.
*   **Ephemeral Chat Interface:** The core chat window, featuring controls for disappearing messages, screenshot protection toggles, and a visual indicator of the end-to-end encryption status.
*   **Secure File Transfer Module:** A component for encrypting and transferring files with clear progress indicators and confirmation of secure deletion from the server upon receipt.

### Micro-Interactions

*   **Button Hover:** A subtle lift and shadow effect to indicate interactivity.
*   **Form Focus:** The input field's border will glow with the primary 'Steel Blue' color to provide a clear focus indicator.
*   **Loading States:** A subtle, pulsing animation on spinners and skeletons, using the 'Fog' color.
*   **Success Actions:** A checkmark icon will animate into view upon a successful, secure action.
*   **Navigation:** A smooth slide-in/out animation for the navigation drawer on mobile.
*   **Scrolling:** A subtle fade-in effect for content as it enters the viewport.

### Responsive Design (Contribution led by the Lead Front-End Developer)

*   **Mobile-First Approach:** The application will be designed for mobile devices first and then scaled up to larger screens. This ensures a seamless and intuitive experience for users on the go.
*   **Breakpoints:** We will use the standard Tailwind CSS breakpoints:
    *   `sm`: 640px
    *   `md`: 768px
    *   `lg`: 1024px
    *   `xl`: 1280px
    *   `2xl`: 1536px
*   **Mobile Adaptations:** Key adaptations for mobile will include a hamburger menu for primary navigation, stacked layouts for complex content, and larger touch targets for all interactive elements to ensure usability.

### Accessibility

We are committed to making Haven accessible to everyone. Our accessibility commitments include:

*   **Color Contrast:** All text will meet WCAG AA contrast ratios against its background.
*   **Keyboard Navigation:** The entire application will be fully navigable using only a keyboard.
*   **Screen Reader Support:** We will use semantic HTML and ARIA attributes to ensure full compatibility with screen readers.
*   **Visible Focus Indicators:** All interactive elements will have a clear and visible focus state.
*   **Respect for Reduced Motion:** All non-essential animations will be disabled if the user has enabled a reduced motion preference in their system settings.

### Dark/Light Mode

Both dark and light modes will be fully supported. We will use **DaisyUI** themes to manage the color schemes. The application will automatically detect the user's system preference on first load and will provide a user-selectable toggle to switch between modes at any time.

## Implementation Guidelines (Contribution led by the Lead Front-End Developer)

### CSS Framework

*   **Tailwind CSS:** The primary utility-first CSS framework for all styling.
*   **DaisyUI:** Used for high-level theming, particularly for managing dark/light mode color variables.
*   **Custom Utilities:** A dedicated file for any custom, reusable CSS classes that fall outside the scope of Tailwind.

### Animation Library

*   **Framer Motion:** The primary library for complex, state-based animations and gestures.
*   **Tailwind Animations:** Used for simple, class-based animations like spins, pulses, and fades.

### Icon System

*   **Heroicons:** The standard icon set for the application, providing a comprehensive and consistent visual language.
*   **Custom SVGs:** Used for unique brand iconography, such as the Haven logo.

### Asset Management

*   **Icons:** SVG
*   **Images:** WebP
*   **Video:** MP4 / WebM

### Code Structure

*   **Component-Based Architecture:** The application will be built using a strict component-based structure (e.g., in React).
*   **Utility-First CSS:** Styling will be applied directly in the markup using Tailwind's utility classes.
*   **Responsive Variants:** Responsive design will be handled using Tailwind's breakpoint variants (e.g., `md:text-lg`).

## Design Tokens (As the Lead Front-End Developer, create a JSON object that codifies the design system's core values. Populate the JSON structure below using the values defined in the Color Palette, Typography, and common spacing/radius conventions. The structure must be exactly as follows.)

```json
{
  "colors": {
    "primary": {
      "midnight-blue": "#0D1B2A",
      "deep-slate": "#1B263B",
      "shadow-blue": "#415A77",
      "steel-blue": "#778DA9",
      "fog": "#A3B1C6",
      "ghost-white": "#E0E1DD"
    },
    "neutral": {
      "primary-text": "#0D1B2A",
      "secondary-text": "#778DA9",
      "background": "#F4F4F8",
      "white": "#FFFFFF",
      "black": "#000000"
    },
    "functional": {
      "success": "#2ECC71",
      "warning": "#F1C40F",
      "error": "#E74C3C",
      "info": "#3498DB"
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter, sans-serif",
      "secondary": "DM Serif Display, serif"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borderRadius": {
    "sm": "0.125rem",
    "md": "0.25rem",
    "lg": "0.5rem",
    "xl": "1rem",
    "full": "9999px"
  }
}
```
