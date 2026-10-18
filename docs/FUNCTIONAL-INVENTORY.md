# Functional Inventory

## Global navigation overlay

| Field | Captured behaviour |
|---|---|
| Interaction | Two-line fixed menu control opens the `.menu` overlay and video background; control changes to the close state. |
| Trigger | Click/tap on the fixed menu control. |
| Visual response | Overlay/background cover shown with About Us, Works, Contact; desktop uses hover effect and mobile exposes duplicated `.mobile_link` entries. |
| Timing | CSS transitions; legacy menu bundle controls class changes. |
| Destination | About, Works, Contact; header also links to Home, metaverse, and 360 video. |
| Keyboard | No dedicated accessible keyboard handling was found in custom inline logic; native anchors remain focusable. |
| Dependencies | Legacy theme CSS/JS, jQuery/GSAP/Barba-related bundle. |

## Homepage slideshow

| Field | Captured behaviour |
|---|---|
| Interaction | Seven full-screen video slides with Prev/Next controls and “Scroll Down”. |
| Trigger | Prev/Next click; linked first two slide captions navigate to Metaverse / Mixed Reality. Later service slide anchors have empty legacy hrefs. |
| Visual response | Current slide uses `.q_current`; number, service label, statement, and muted looping background video change. |
| Timing | Theme bundle animation / CSS transitions. |
| Mobile | Uses the same slideshow markup; exact rendered baseline screenshots unavailable (see `baseline/README.md`). |
| Dependencies | first-party MP4s; legacy GSAP/ScrollTrigger/slider logic. |

## Contact multi-step form

- **Endpoint/method as in source:** `post` `https://angelcreations.in/contact-us/`
- **Fields (source labels):** Ahoy. What's your name?; What's your mobile number?; What's your email?; What's the name of your company?; Tell us a bit about your project.; Do you have any budget in mind?; Do you want us to contact you through Mail or call?; If call then what is your preferred time?
- **Validation:** jQuery Validate with required rules; email validation for `email` in the captured inline code.
- **Progression:** visible `.tab-pane` step changes with 1000ms `fadeIn`; progress dots switch active class.
- **Success state:** a 1000ms timeout replaces `#booking-form` content with: `Your message was sent successfully. Thanks! We'll be in touch as soon as we can, which is usually like lightning (Unless we're sailing or eating tacos!).`
- **Submission observation:** no test was sent. The captured custom final click handler returns `false`, so its local visible success state is reconstructed without sending data anywhere.

## Other meaningful interactions

- **360 video:** Panorama block configuration identifies a first-party equirectangular video, autoplay true, loop true, muted false, controls false, fullscreen/settings/video controls true. Depends on Panorama plugin + Three.js + Panolens.
- **Metaverse:** standalone Unity canvas page, desktop 960×600; mobile switches canvas to viewport and shows “WebGL builds are not supported on mobile devices.” Fullscreen button is wired by Unity after instance creation.
- **Work cards:** hover data attributes set colour/background/cursor label `View`; cards link to six published work entries. The full source still lists dead `/works/<slug>` links inside templates, all captured as 404s.
- **Custom cursor/text reveals/loaders:** documented in the inline scripts and theme bundle. The React baseline recreates safe visible equivalents only; no legacy external code executes.
