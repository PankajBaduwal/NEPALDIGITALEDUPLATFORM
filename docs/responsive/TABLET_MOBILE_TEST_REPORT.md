# Tablet and mobile test report

Widths tested: 360, 390 (visual check), 430, 768 for all routes; 1024 as the first desktop-sidebar width.

| Check | Result |
|---|---|
| Public pages at 360 / 390 / 430 / 768 | no overflow, after 3 fixes below |
| Principal, School Admin, Teacher, Student, Super Admin at 360 and 768, every sidebar section | no overflow |
| Class Teacher section and 4 sub-tabs at 360 and 768 | no overflow |
| Drawer | opens with the Menu button; closes by overlay, Escape (focus returns), and choosing a section; button 44 x 44 px; `aria-expanded` kept in sync |
| Phone screenshot, Principal (390 px) | readable single column; banner no longer under the Menu button |
| Tablet screenshot, Principal (768 px) | four stat cards per row, banner and charts fit |

## Baseline versus now (360 px)

| Page | Before (forced width) | Now |
|---|---|---|
| Principal | 612 px | 360 px |
| School Admin | 1211 px | 360 px |
| Student | 637 px | 360 px |
| Teacher | 823 px | 360 px |
| Super Admin | 437 px | 360 px |

## Defects found and fixed

1. Homepage header: brand text too wide at 360 px (Menu button pushed off screen). Fixed.
2. Login: decorative orb caused an 11 px sideways scroll on phones. Hidden below 760 px.
3. Registration: the form column was clipped by about 27 px at tablet width. Split layout now stacks below 1024 px.
4. All dashboards: Menu button and demo banner overlap, and the button covering the drawer's logo while the drawer was open. Fixed.

## Not verified

- Real devices. Browser emulation does not reproduce touch targets, on-screen keyboards, safe-area insets or the exact browser chrome of a phone.
- Orientation changes (landscape) were not separately tested.
- Wide tables stay as horizontally scrollable tables on phones; they were not converted to record cards.
- Forms were checked for fit, not for every validation message or the keyboard type each field opens.
