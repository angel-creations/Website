# Script Inventory

> Script sources were inventoried; tracking code is not run by the local React reconstruction. The full source references and inline snippets are in [`page-records.json`](./page-records.json).

| Source | Local / external | Purpose | Page usage | Init / listeners |
|---|---|---|---:|---|
| `[inline script]` | inline | Inline page/template logic (details are retained in raw HTML) | 55 pages | Template/DOMContentLoaded/load/click/scroll handlers retained in raw source |
| `https://angelcreations.in/wp-content/plugins/contact-form-7/includes/js/index.js?ver=6.1.3` | local archived | Contact Form 7 client-side validation / submission support | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-content/plugins/contact-form-7/includes/swv/js/index.js?ver=6.1.3` | local archived | Contact Form 7 client-side validation / submission support | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-content/plugins/panorama/build/blocks/video/view.js?ver=29ced07a00bddfce82ba` | local archived | Panorama/360 viewer dependency | 1 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-content/plugins/panorama/public/assets/js/panolens.min.js?ver=1.4.1` | local archived | Panorama/360 viewer dependency | 1 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-content/plugins/panorama/public/assets/js/three.min.js?ver=1.4.1` | local archived | Panorama/360 viewer dependency | 1 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-content/themes/fleava/assets/js/primary-navigation.js?ver=db8409c0e4e8b69e05f5f7bde868a51f` | local archived | Twenty Twenty-One primary navigation helper | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-content/themes/fleava/assets/js/responsive-embeds.js?ver=db8409c0e4e8b69e05f5f7bde868a51f` | local archived | Twenty Twenty-One responsive embed helper | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-content/themes/fleava/assets/js/scripts.js` | local archived | Custom theme bundle: Modernizr, GSAP/ScrollTrigger, Barba, Locomotive/Splitting and site behaviour | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-includes/js/comment-reply.min.js?ver=db8409c0e4e8b69e05f5f7bde868a51f` | local archived | Legacy WordPress/theme runtime asset | 1 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-includes/js/dist/hooks.min.js?ver=f0f188028580e8dc1255` | local archived | Legacy WordPress/theme runtime asset | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-includes/js/dist/i18n.min.js?ver=1dfe7db3940c23ea9216` | local archived | Legacy WordPress/theme runtime asset | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-includes/js/dist/vendor/react-dom.min.js?ver=18.3.1.1` | local archived | WordPress bundled React runtime, used by panorama block | 1 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-includes/js/dist/vendor/react.min.js?ver=18.3.1.1` | local archived | WordPress bundled React runtime, used by panorama block | 1 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-includes/js/jquery/jquery-migrate.min.js?ver=3.4.1` | local archived | jQuery / validation dependency | 54 pages | Loaded by WordPress template |
| `https://angelcreations.in/wp-includes/js/jquery/jquery.min.js?ver=3.7.1` | local archived | jQuery / validation dependency | 54 pages | Loaded by WordPress template |
| `https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js` | external | Owl Carousel library | 54 pages | Loaded by WordPress template |
| `https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.5/jquery.validate.min.js` | external | jQuery / validation dependency | 54 pages | Loaded by WordPress template |
| `https://code.jquery.com/jquery-2.2.4.min.js` | external | jQuery / validation dependency | 54 pages | Loaded by WordPress template |
| `https://www.googletagmanager.com/gtag/js?id=G-T4G74DNBP9` | external | Google Analytics gtag loader (tracking) | 54 pages | Loaded by WordPress template |
| `https://www.krowd.com.au/js/slick.min.js` | external | Slick carousel library | 54 pages | Loaded by WordPress template |

## Notable implementation findings

- `scripts.js` contains legacy bundled Modernizr, GSAP + ScrollTrigger, Barba, Locomotive-like scroll handling, Splitting, and Three-related code. It is preserved in the asset archive but not executed from React.
- Inline scripts drive: navigation-menu classes, a homepage slider, animated text splitting, a contact multi-step form, Owl/Slick initialization, a custom cursor, loader delays, and scroll-triggered class changes.
- The 360 page loads `three.min.js`, `panolens.min.js`, and the Panorama plugin view script; it declares a first-party 360 MP4 source in a block data attribute.
- The live source also includes Site Kit-added Google Analytics (`G-T4G74DNBP9`) and GTM (`GTM-MMFB2VZ`). IDs are documented here for baseline purposes; no tracker is included in the React runtime.
