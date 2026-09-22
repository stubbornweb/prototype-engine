# Cinematic Hero

Purpose: create immediate visual identity without requiring a full 3D scene.

Structure:
- full viewport hero
- strong editorial headline
- atmospheric visual layer
- compact supporting copy
- one obvious CTA

Motion:
- page-load reveal
- slow background motion
- restrained headline stagger

Implementation preference:
- CSS + Motion first
- generated video when the visual benefits from cinematic passive motion
- R3F only if the object must respond to user input

Mobile:
- use a static poster or lightweight crop when video/3D is too expensive

Performance:
- preload only the first visual asset that materially improves LCP
- lazy load below-the-fold media
