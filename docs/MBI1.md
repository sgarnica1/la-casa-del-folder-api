# MBI Scope — Advanced Photo Editor (v1)

## Objective

Upgrade the current MVP photo preview into a controlled, production-ready editor that allows users to properly prepare images for printing.

This version must:
- Improve print reliability
- Reduce low-quality uploads
- Prevent layout issues
- Stay simple and fast

This is NOT Photoshop.
This is a constrained print-prep editor.

---

# 1. Core Principles

- Non-destructive editing
- Fast interactions (no reloads)
- Mobile-first
- Print-aware (aspect ratio locked when required)
- Simple UI (max 6 visible primary controls)

---

# 2. Required Features

## 2.1 Crop (Primary Feature)

### Behavior
- User can drag image inside fixed print frame
- Maintain required aspect ratio (based on product format)
- Show cropping boundaries clearly
- Prevent empty areas

### Requirements
- Lock aspect ratio per product (e.g., 4:5, A4, square, etc.)
- Show overflow area dimmed
- Snap back if image leaves safe zone

### Output
Store:
- scale
- x position
- y position
- rotation
- container dimensions

---

## 2.2 Zoom (Scale)

### Behavior
- Zoom in/out with:
  - Buttons (+ / -)
  - Mouse wheel (desktop)
  - Pinch gesture (mobile)

### Constraints
- Minimum zoom: image must fully cover crop frame
- Maximum zoom: 300% of original resolution
- Live update quality indicator

---

## 2.3 Rotate

### Behavior
- Rotate in 90° increments (required)
- Optional: free rotation slider (-45° to +45°)

### Constraints
- Recalculate crop bounds after rotation
- Prevent blank corners

---

## 2.4 Grid Overlay

### Behavior
- Toggleable grid overlay
- Rule-of-thirds grid
- Semi-transparent
- Non-exported

Purpose:
- Help composition
- Align faces and key elements

---

## 2.5 Replace Image

### Behavior
- Upload new image
- Preserve crop area if possible
- Reset transform if aspect ratio differs significantly

---

## 2.6 Delete Image

### Behavior
- Remove image from layout
- Return to empty state
- Confirmation modal required

---

# 3. Quality Indicator (Improved)

Replace static score with dynamic system.

## Must Calculate:

- Effective DPI at current scale
- Resolution vs print size
- Compression artifacts (optional future)

## Show:

- Green (Good for print)
- Yellow (Acceptable)
- Red (Low quality)

Display:
- Resolution
- Print size
- Recommended minimum

---

# 4. UI Layout

## Left Side
- Editable canvas
- Fixed print frame
- Image draggable inside frame

## Right Side Panel
- Quality indicator
- Scale %
- Image resolution
- Action buttons

Primary Buttons:
- Crop (default mode)
- Rotate
- Grid
- Replace
- Delete

Bottom:
- Cancel
- Save

---

# 5. Data Model

Store per image:

```ts
{
  imageId: string
  originalWidth: number
  originalHeight: number
  scale: number
  rotation: number
  offsetX: number
  offsetY: number
  cropWidth: number
  cropHeight: number
}
Edits must be reproducible server-side for final export.

6. Performance Constraints

No full re-renders on drag

Use canvas or transform-based rendering

Debounce quality calculation

No blocking UI during image load

Target:

<16ms drag response

<100ms quality recalculation

7. Out of Scope (For Now)

Filters

Brightness / contrast

Background removal

Multi-layer editing

Text overlays

AI auto-enhance

8. Success Criteria

User can adjust photo in under 10 seconds

Zero blank-space print errors

Reduced support tickets for “cut faces”

Improved print satisfaction rate

9. Future Phase (Not in MBI)

Smart auto-crop

Face detection centering

Auto quality correction

Preset framing styles

Multi-photo layouts

Definition of Done

Works on desktop + mobile

Tested on low-resolution images

Export matches preview exactly

Webhook saves transformation correctly

No visual glitches during drag/zoom